import React, { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { API_BASE } from '../../utils/api';

const SOCKET_URL = API_BASE.replace(/\/api\/?$/, ''); // http://localhost:5000/api -> http://localhost:5000
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB — must match backend's maxHttpBufferSize

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Live, ephemeral file sharing scoped to one class (standard). Files are
 * relayed peer-to-peer through the server for the duration of the session —
 * nothing is written to disk or the database. Only teachers/admins can send;
 * students receive-only, matching the backend's role check.
 *
 * Props:
 *  - standard: the class this panel is scoped to (e.g. "10A") — required.
 *  - canSend: whether this user is allowed to broadcast files (teacher/admin).
 *  - senderLabel: display name shown next to files this user sends.
 */
export default function ClassFileShare({ standard, canSend = false, senderLabel = 'You', visible = true, onNewFile }) {
  const [connected, setConnected] = useState(false);
  const [files, setFiles] = useState([]); // { id, name, type, size, url, senderName, sentAt, mine }
  const [unseenCount, setUnseenCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const objectUrlsRef = useRef([]); // track for cleanup
  const wasVisibleRef = useRef(visible);

  // Reset the unread badge whenever the panel becomes visible.
  useEffect(() => {
    if (visible) setUnseenCount(0);
    wasVisibleRef.current = visible;
  }, [visible]);

  useEffect(() => {
    if (standard === undefined) return; // no class context at all — nothing to join

    const token = localStorage.getItem('token');
    const socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_class', standard);
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', (err) => setError(err.message || 'Could not connect to live file sharing.'));
    socket.on('file_share_error', (data) => setError(data.message || 'File sharing error.'));

    socket.on('receive_file', (data) => {
      const blob = new Blob([data.fileData], { type: data.fileType });
      const url = URL.createObjectURL(blob);
      objectUrlsRef.current.push(url);
      setFiles(prev => [
        { id: `${data.sentAt}-${data.fileName}`, name: data.fileName, type: data.fileType, size: blob.size, url, senderName: data.senderName, sentAt: data.sentAt, mine: false },
        ...prev,
      ]);
      if (!wasVisibleRef.current) setUnseenCount(c => c + 1);
      onNewFile?.(data);
    });

    return () => {
      socket.emit('leave_class', standard);
      socket.disconnect();
      objectUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
      objectUrlsRef.current = [];
    };
  }, [standard]);

  const handlePick = useCallback((e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;
    setError('');

    if (file.size > MAX_FILE_BYTES) {
      setError('That file is larger than the 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => setError('Could not read that file.');
    reader.onload = () => {
      const fileBuffer = reader.result;
      setSending(true);
      socketRef.current?.emit('send_file', {
        standard, fileName: file.name, fileType: file.type, fileBuffer,
      }, (ack) => {
        setSending(false);
        if (!ack?.ok) {
          setError(ack?.message || 'Failed to share file.');
          return;
        }
        // Show it in our own list too, so the teacher sees what was sent.
        const url = URL.createObjectURL(file);
        objectUrlsRef.current.push(url);
        setFiles(prev => [
          { id: `${Date.now()}-${file.name}`, name: file.name, type: file.type, size: file.size, url, senderName: senderLabel, sentAt: Date.now(), mine: true },
          ...prev,
        ]);
      });
    };
    reader.readAsArrayBuffer(file);
  }, [standard, senderLabel]);

  if (!visible) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: '#9a98ab' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: connected ? '#00a86b' : '#ba1a1a' }} />
        {connected ? 'Connected' : 'Connecting…'}
        {unseenCount > 0 && (
          <span style={{ background: '#ba1a1a', color: '#fff', borderRadius: 999, padding: '1px 7px', fontSize: 10.5, fontWeight: 800 }}>
            {unseenCount} new
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #e5eeff', borderRadius: 12, padding: 16, background: '#fafbff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? '#00a86b' : '#ba1a1a' }} />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0b1c30' }}>
            Live file sharing — {standard ? `Class ${standard}` : 'School-wide'}
          </span>
        </div>
        {canSend && (
          <>
            <input ref={fileInputRef} type="file" accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" onChange={handlePick} style={{ display: 'none' }} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!connected || sending}
              style={{
                padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 700, background: '#3525cd', color: '#fff',
                opacity: (!connected || sending) ? 0.6 : 1,
              }}>
              {sending ? 'Sending…' : '+ Share File'}
            </button>
          </>
        )}
      </div>

      {error && <p style={{ color: '#ba1a1a', fontSize: 12, margin: '0 0 10px 0' }}>{error}</p>}

      {files.length === 0 ? (
        <p style={{ fontSize: 12, color: '#9a98ab', margin: 0 }}>
          {canSend ? 'Files you share here appear instantly for the whole class.' : 'No files shared yet — they\'ll appear here the moment your teacher sends one.'}
        </p>
      ) : (
        <div style={{ display: 'grid', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
          {files.map(f => (
            <div key={f.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
              background: '#fff', border: '1px solid #e5eeff', borderRadius: 8, padding: '8px 12px',
            }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: '#0b1c30', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</p>
                <p style={{ margin: 0, fontSize: 11, color: '#777587' }}>
                  {f.mine ? senderLabel : f.senderName} · {formatSize(f.size)} · {new Date(f.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <a href={f.url} download={f.name} style={{ fontSize: 11.5, fontWeight: 700, color: '#3525cd', whiteSpace: 'nowrap' }}>Download</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
