import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3, CalendarDays, ChevronRight, CircleUserRound,
  Clock3, Inbox, LogOut, Mail, RefreshCw, Search, ShieldCheck,
  SlidersHorizontal, UserRoundCheck,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import './AdminPage.css';

const BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];
const ENQUIRY_STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

const statusLabel = (value = '') => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const localDateKey = (date = new Date()) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');
const safeDate = (value, options = {}) => value && !Number.isNaN(new Date(value).getTime())
  ? new Intl.DateTimeFormat('en-ZA', options).format(new Date(value))
  : '—';

function extractLine(text = '', label) {
  const line = text.split('\n').find((entry) => entry.toLowerCase().startsWith(`${label.toLowerCase()}:`));
  return line ? line.slice(line.indexOf(':') + 1).trim() : '';
}

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) setError(authError.message);
    setLoading(false);
  };

  return (
    <main className="admin-login-shell">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <div className="admin-brand">KLYRON<span>.</span></div>
        <div className="admin-login-icon"><ShieldCheck size={22} /></div>
        <p className="admin-kicker">Private workspace</p>
        <h1 id="admin-login-title">Admin access</h1>
        <p className="admin-login-copy">Manage consultations, website enquiries and qualified opportunities.</p>
        <form onSubmit={submit} className="admin-login-form">
          <label htmlFor="admin-email">Email</label>
          <input id="admin-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label htmlFor="admin-password">Password</label>
          <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="admin-error" role="alert">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in securely'}</button>
        </form>
        <a href="/" className="admin-back-link">Return to website</a>
      </section>
    </main>
  );
}

function Metric({ icon: Icon, label, value, detail }) {
  return (
    <article className="admin-metric">
      <div className="admin-metric-icon"><Icon size={18} /></div>
      <div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
    </article>
  );
}

function EmptyState({ children }) {
  return <div className="admin-empty"><Inbox size={24} /><p>{children}</p></div>;
}

function StatusFilter({ value, statuses, onChange }) {
  return (
    <div className="admin-filter" role="group" aria-label="Filter by status">
      <button className={value === 'all' ? 'active' : ''} onClick={() => onChange('all')} aria-pressed={value === 'all'}>All</button>
      {statuses.map((status) => (
        <button key={status} className={value === status ? 'active' : ''} onClick={() => onChange(status)} aria-pressed={value === status}>
          {statusLabel(status)}
        </button>
      ))}
    </div>
  );
}

function RecordDrawer({ record, type, onClose, onSave }) {
  const statuses = type === 'booking' ? BOOKING_STATUSES : ENQUIRY_STATUSES;
  const [status, setStatus] = useState(record.status || statuses[0]);
  const [notes, setNotes] = useState(record.internal_notes || '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const closeButtonRef = useRef(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const closeOnEscape = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const save = async () => {
    setSaving(true);
    setSaveError('');
    const result = await onSave(record.id, { status, internal_notes: notes });
    if (!result.ok) setSaveError(result.message);
    setSaving(false);
  };

  return (
    <div className="admin-drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="admin-drawer" role="dialog" aria-modal="true" aria-labelledby="admin-record-title">
        <header><div><p>{type === 'booking' ? 'Consultation' : 'Website enquiry'}</p><h2 id="admin-record-title">{record.name}</h2></div><button ref={closeButtonRef} onClick={onClose} aria-label="Close details">×</button></header>
        <dl className="admin-details">
          <div><dt>Email</dt><dd><a href={`mailto:${record.email}`}>{record.email}</a></dd></div>
          <div><dt>Company</dt><dd>{record.company || 'Not provided'}</dd></div>
          {type === 'booking' && <><div><dt>Date</dt><dd>{safeDate(record.date, { dateStyle: 'long' })} · {record.time}</dd></div><div><dt>Timezone</dt><dd>{record.timezone || 'Not provided'}</dd></div></>}
          <div><dt>Received</dt><dd>{safeDate(record.created_at, { dateStyle: 'medium', timeStyle: 'short' })}</dd></div>
        </dl>
        <div className="admin-message-block"><span>Submitted information</span><p>{record.notes || record.message || 'No additional details.'}</p></div>
        <label className="admin-field">Status<select value={status} onChange={(e) => setStatus(e.target.value)}>{statuses.map((item) => <option key={item} value={item}>{statusLabel(item)}</option>)}</select></label>
        <label className="admin-field">Internal notes<textarea rows="6" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add qualification notes, next steps or project context…" /></label>
        {saveError && <p className="admin-error" role="alert">{saveError}</p>}
        <div className="admin-drawer-actions"><a href={`mailto:${record.email}`}>Email contact</a><button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button></div>
      </aside>
    </div>
  );
}

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authorized, setAuthorized] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('overview');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  const loadData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError('');
    const [adminResult, bookingResult, enquiryResult] = await Promise.all([
      supabase.from('admin_users').select('user_id, full_name, role').eq('user_id', session.user.id).maybeSingle(),
      supabase.from('meeting_requests').select('*').order('date', { ascending: true }).order('time', { ascending: true }),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
    ]);
    if (adminResult.error || !adminResult.data || adminResult.data.role !== 'admin') {
      setAuthorized(false);
      setAdminProfile(null);
      setError(adminResult.error?.message || 'This account does not have administrator access.');
    } else {
      setAuthorized(true);
      setAdminProfile(adminResult.data);
      setBookings(bookingResult.data || []);
      setEnquiries(enquiryResult.data || []);
      if (bookingResult.error || enquiryResult.error) setError(bookingResult.error?.message || enquiryResult.error?.message);
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    if (session) loadData();
    else {
      setAuthorized(null);
      setAdminProfile(null);
      setBookings([]);
      setEnquiries([]);
    }
  }, [session, loadData]);

  const filteredBookings = useMemo(() => bookings.filter((item) => {
    const matchesSearch = `${item.name} ${item.email} ${item.company || ''}`.toLowerCase().includes(search.trim().toLowerCase());
    return matchesSearch && (statusFilter === 'all' || item.status === statusFilter);
  }), [bookings, search, statusFilter]);
  const filteredEnquiries = useMemo(() => enquiries.filter((item) => {
    const matchesSearch = `${item.name} ${item.email} ${item.company || ''}`.toLowerCase().includes(search.trim().toLowerCase());
    return matchesSearch && (statusFilter === 'all' || (item.status || 'new') === statusFilter);
  }), [enquiries, search, statusFilter]);
  const now = new Date();
  const today = localDateKey(now);
  const upcoming = bookings.filter((item) => item.date >= today && !['cancelled', 'completed'].includes(item.status));
  const monthCount = bookings.filter((item) => item.date?.startsWith(today.slice(0, 7))).length;
  const campaignLeads = [...bookings, ...enquiries].filter((item) => /Source:|utm_/i.test(item.notes || item.message || '')).length;

  const changeView = (nextView) => {
    setView(nextView);
    setSearch('');
    setStatusFilter('all');
  };

  const saveRecord = async (type, id, changes) => {
    const table = type === 'booking' ? 'meeting_requests' : 'contact_messages';
    const { error: updateError } = await supabase.from(table).update({ ...changes, updated_at: new Date().toISOString() }).eq('id', id);
    if (updateError) {
      setError(updateError.message);
      return { ok: false, message: updateError.message };
    }
    const setter = type === 'booking' ? setBookings : setEnquiries;
    setter((items) => items.map((item) => item.id === id ? { ...item, ...changes } : item));
    setSelected(null);
    return { ok: true };
  };

  if (!authReady) return <main className="admin-loading">Checking secure access…</main>;
  if (!session) return <AdminLogin />;
  if (authorized === null) return <main className="admin-loading">Loading your workspace…</main>;
  if (authorized === false) return <main className="admin-loading"><ShieldCheck size={28} /><h1>Access not authorised</h1><p>{error}</p><button onClick={() => supabase.auth.signOut()}>Sign out</button></main>;

  const nav = [
    ['overview', BarChart3, 'Overview'], ['bookings', CalendarDays, 'Bookings'],
    ['enquiries', Inbox, 'Enquiries'], ['campaigns', SlidersHorizontal, 'Campaigns'],
  ];

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <a href="/" className="admin-brand">KLYRON<span>.</span></a>
        <nav>{nav.map(([key, Icon, label]) => <button key={key} className={view === key ? 'active' : ''} onClick={() => changeView(key)}><Icon size={17} />{label}</button>)}</nav>
        <button className="admin-signout" onClick={() => supabase.auth.signOut()}><LogOut size={17} />Sign out</button>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar">
          <div><p>Operations workspace</p><h1>{nav.find(([key]) => key === view)?.[2]}</h1></div>
          <div className="admin-top-actions">{['bookings', 'enquiries'].includes(view) && <label><Search size={16} /><input type="search" autoComplete="off" aria-label={`Search ${view}`} placeholder="Search name, email or company…" value={search} onChange={(e) => setSearch(e.target.value)} /></label>}<button onClick={loadData} disabled={loading} aria-label="Refresh data" title="Refresh data"><RefreshCw className={loading ? 'is-spinning' : ''} size={17} /></button><div className="admin-avatar" title={adminProfile?.full_name || session.user.email}><CircleUserRound size={18} /><span>{adminProfile?.full_name || session.user.email}</span></div></div>
        </header>
        {error && <div className="admin-banner" role="alert">{error}</div>}

        {view === 'overview' && <>
          <section className="admin-metrics">
            <Metric icon={CalendarDays} label="Upcoming consultations" value={upcoming.length} detail={`${monthCount} booked this month`} />
            <Metric icon={Clock3} label="Awaiting confirmation" value={bookings.filter((item) => item.status === 'pending').length} detail="Bookings requiring action" />
            <Metric icon={Inbox} label="New enquiries" value={enquiries.filter((item) => !item.status || item.status === 'new').length} detail="From the project contact form" />
            <Metric icon={UserRoundCheck} label="Attributed leads" value={campaignLeads} detail="Connected to a tracked campaign" />
          </section>
          <section className="admin-panel"><div className="admin-panel-head"><div><p>Next actions</p><h2>Upcoming consultations</h2></div><button onClick={() => changeView('bookings')}>View all <ChevronRight size={15} /></button></div><BookingList records={upcoming.slice(0, 6)} onOpen={(record) => setSelected({ type: 'booking', record })} /></section>
        </>}

        {view === 'bookings' && <section className="admin-panel"><div className="admin-panel-head"><div><p>Calendar queue</p><h2>Consultation bookings</h2></div><span>{filteredBookings.length} of {bookings.length}</span></div><StatusFilter value={statusFilter} statuses={BOOKING_STATUSES} onChange={setStatusFilter} /><BookingList records={filteredBookings} onOpen={(record) => setSelected({ type: 'booking', record })} /></section>}
        {view === 'enquiries' && <section className="admin-panel"><div className="admin-panel-head"><div><p>Inbound interest</p><h2>Project enquiries</h2></div><span>{filteredEnquiries.length} of {enquiries.length}</span></div><StatusFilter value={statusFilter} statuses={ENQUIRY_STATUSES} onChange={setStatusFilter} /><EnquiryList records={filteredEnquiries} onOpen={(record) => setSelected({ type: 'enquiry', record })} /></section>}
        {view === 'campaigns' && <CampaignView records={[...bookings, ...enquiries]} />}
      </main>
      <nav className="admin-mobile-nav">{nav.map(([key, Icon, label]) => <button key={key} className={view === key ? 'active' : ''} onClick={() => changeView(key)}><Icon size={18} /><span>{label}</span></button>)}</nav>
      {selected && <RecordDrawer type={selected.type} record={selected.record} onClose={() => setSelected(null)} onSave={(id, changes) => saveRecord(selected.type, id, changes)} />}
    </div>
  );
}

function BookingList({ records, onOpen }) {
  if (!records.length) return <EmptyState>No consultations match this view.</EmptyState>;
  return <div className="admin-list">{records.map((item) => <button className="admin-row" key={item.id} onClick={() => onOpen(item)}><div className="admin-date-tile"><strong>{safeDate(item.date, { day: '2-digit' })}</strong><span>{safeDate(item.date, { month: 'short' })}</span></div><div className="admin-person"><strong>{item.name}</strong><span>{item.company || item.email}</span></div><div className="admin-row-meta"><span>{item.time}</span><small>{item.timezone || 'Timezone not provided'}</small></div><span className={`admin-status status-${item.status}`}>{statusLabel(item.status)}</span><ChevronRight size={17} /></button>)}</div>;
}

function EnquiryList({ records, onOpen }) {
  if (!records.length) return <EmptyState>No enquiries match this view.</EmptyState>;
  return <div className="admin-list">{records.map((item) => <button className="admin-row admin-enquiry-row" key={item.id} onClick={() => onOpen(item)}><div className="admin-mail-tile"><Mail size={17} /></div><div className="admin-person"><strong>{item.name}</strong><span>{item.company || item.email}</span></div><div className="admin-row-meta"><span>{extractLine(item.message, 'Support needed') || 'General enquiry'}</span><small>{safeDate(item.created_at, { dateStyle: 'medium' })}</small></div><span className={`admin-status status-${item.status || 'new'}`}>{statusLabel(item.status || 'new')}</span><ChevronRight size={17} /></button>)}</div>;
}

function CampaignView({ records }) {
  const campaigns = records.reduce((acc, item) => {
    const text = item.notes || item.message || '';
    const campaign = text.match(/utm_campaign[=:]([a-z0-9_-]+)/i)?.[1] || extractLine(text, 'Source').match(/utm_campaign=([a-z0-9_-]+)/i)?.[1];
    if (campaign) acc[campaign] = (acc[campaign] || 0) + 1;
    return acc;
  }, {});
  const entries = Object.entries(campaigns).sort((a, b) => b[1] - a[1]);
  return <section className="admin-panel"><div className="admin-panel-head"><div><p>Attribution</p><h2>Campaign conversions</h2></div><span>{entries.length} campaigns</span></div>{entries.length ? <div className="admin-campaigns">{entries.map(([name, count]) => <div key={name}><div><strong>{name.replaceAll('_', ' ')}</strong><span>{count} converted {count === 1 ? 'lead' : 'leads'}</span></div><div className="admin-campaign-bar"><i style={{ width: `${Math.max(12, (count / entries[0][1]) * 100)}%` }} /></div></div>)}</div> : <EmptyState>Tracked campaign conversions will appear here after visitors submit a form or book a consultation.</EmptyState>}</section>;
}
