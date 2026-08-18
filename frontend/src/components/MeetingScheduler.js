import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Building2,
  FileText,
  AlertCircle,
  Briefcase,
  Layers,
  Check,
  ChevronLeft,
  ChevronRight,
  PartyPopper,
} from 'lucide-react';
import { Calendar } from '../components/ui/calendar';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { supabase } from '../lib/supabase';
import { format, addDays, isBefore, startOfToday } from 'date-fns';

const ALL_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

const SERVICE_OPTIONS = [
  'BIM Coordination',
  'Clash Detection & Issue Review',
  'BIM QA/QC & Model Validation',
  '4D/5D BIM Support',
  'COBie & Information Management',
  'On-Demand BIM Support',
  'Not Sure Yet',
];

const PROJECT_STAGE_OPTIONS = [
  'Design Stage',
  'Pre-Construction',
  'Construction',
  'Tender / Proposal Stage',
  'Existing Model Review',
  'Urgent Coordination Support',
  'Not Sure Yet',
];

const MEETING_FOCUS_OPTIONS = [
  'Review project requirements',
  'Discuss BIM coordination support',
  'Discuss clash detection workflow',
  'Discuss model QA/QC or validation',
  'Discuss 4D/5D or quantity support',
  'Discuss urgent project support',
  'General introduction call',
];

const selectClass = 'w-full bg-[#1E293B] border border-[#334155] text-[#F8FAFC] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent appearance-none transition-colors duration-200';
const selectEmptyClass = 'w-full bg-[#1E293B] border border-[#334155] text-[#64748B] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent appearance-none transition-colors duration-200';

const stepVariants = {
  enter: (direction) => ({ x: direction > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction > 0 ? -60 : 60, opacity: 0 }),
};

const STEPS = [
  { id: 1, label: 'Date & Time' },
  { id: 2, label: 'Your Details' },
];

const MeetingScheduler = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service: '',
    projectStage: '',
    meetingFocus: '',
    notes: '',
  });

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(format(selectedDate, 'yyyy-MM-dd'));
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async (date) => {
    setIsLoading(true);
    setSelectedTime('');
    try {
      const { data, error } = await supabase
        .rpc('get_booked_times', { booking_date: date });

      if (error) throw error;

      const bookedTimes = (data || []).map(r => r.booked_time);
      setAvailableSlots(ALL_SLOTS.filter(slot => !bookedTimes.includes(slot)));
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAvailableSlots(ALL_SLOTS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const goToStep = (targetStep) => {
    setDirection(targetStep > step ? 1 : -1);
    setStep(targetStep);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !formData.name || !formData.email || !formData.service || !formData.notes) {
      setSubmitStatus({ type: 'error', message: 'Please fill in all required fields and select a date and time.' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    const enrichedNotes = [
      formData.service ? `Service Needed: ${formData.service}` : '',
      formData.projectStage ? `Project Stage: ${formData.projectStage}` : '',
      formData.meetingFocus ? `Meeting Focus: ${formData.meetingFocus}` : '',
      formData.notes ? `Notes: ${formData.notes}` : '',
    ].filter(Boolean).join('\n');

    try {
      const { error } = await supabase.from('meeting_requests').insert([{
        name: formData.name,
        email: formData.email,
        company: formData.company || null,
        notes: enrichedNotes,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        status: 'pending',
      }]);

      if (error) throw error;

      setIsSuccess(true);
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Failed to schedule meeting. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetScheduler = () => {
    setFormData({ name: '', email: '', company: '', service: '', projectStage: '', meetingFocus: '', notes: '' });
    setSelectedDate(null);
    setSelectedTime('');
    setSubmitStatus(null);
    setIsSuccess(false);
    setDirection(-1);
    setStep(1);
  };

  const disabledDays = (date) => {
    const today = startOfToday();
    const maxDate = addDays(today, 60);
    return isBefore(date, today) || date > maxDate || date.getDay() === 0 || date.getDay() === 6;
  };

  const canContinue = Boolean(selectedDate && selectedTime);

  return (
    <section
      ref={sectionRef}
      id="schedule"
      data-testid="schedule-section"
      className="py-24 lg:py-32 bg-[#0F172A] relative overflow-hidden"
    >
      {/* Background Accent — scroll parallax */}
      <motion.div className="absolute inset-0 overflow-hidden" style={{ y: bgY }}>
        <div
          className="hero-bg-motion absolute inset-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1766802981801-4b4a9a1d8f1c?crop=entropy&cs=srgb&fm=jpg&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.32,
          }}
        />
      </motion.div>
      {/* Same gradient overlay as hero */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        background: 'linear-gradient(to bottom, #0F172A 0%, rgba(15,23,42,0.55) 30%, rgba(15,23,42,0.3) 55%, rgba(15,23,42,0.7) 80%, #0F172A 100%)',
      }} />

      {/* Ambient floating glow blobs for extra depth */}
      <div className="absolute pointer-events-none float-deco" style={{
        top: '-60px', left: '5%', width: '340px', height: '340px', '--dur': '11s',
        background: 'radial-gradient(circle, rgba(14,165,233,0.10) 0%, transparent 65%)',
      }} />
      <div className="absolute pointer-events-none float-deco" style={{
        bottom: '-40px', right: '8%', width: '300px', height: '300px', '--dur': '13s',
        background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 65%)',
      }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[#0EA5E9] font-mono text-sm mb-2" data-testid="schedule-label">// SCHEDULE</p>
          <h2
            data-testid="schedule-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Book a <span className="text-[#0EA5E9]">Consultation</span>
          </h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto">
            Schedule a free consultation to discuss your project needs and how we can help optimize your BIM workflow.
          </p>
        </motion.div>

        {/* Scheduler Card */}
        <motion.div
          data-testid="scheduler-card"
          className="glass rounded-2xl max-w-4xl mx-auto overflow-hidden relative"
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                data-testid="schedule-success"
                className="flex flex-col items-center justify-center text-center py-20 px-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                  style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.4)' }}
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                >
                  <Check size={36} className="text-green-400" />
                </motion.div>
                <motion.h3
                  className="text-2xl font-bold text-[#F8FAFC] mb-3 flex items-center gap-2"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  Meeting Scheduled <PartyPopper size={22} className="text-[#22D3EE]" />
                </motion.h3>
                <motion.p
                  className="text-[#94A3B8] max-w-md mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  You will receive a confirmation email shortly with your meeting details.
                </motion.p>
                {selectedDate && selectedTime && (
                  <motion.p
                    className="font-mono text-[#0EA5E9] mb-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    {format(selectedDate, 'EEEE, MMMM dd, yyyy')} at {selectedTime}
                  </motion.p>
                )}
                <motion.button
                  type="button"
                  data-testid="schedule-another-btn"
                  onClick={resetScheduler}
                  className="btn-outline px-6 py-2.5 rounded-sm text-sm font-medium"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Schedule Another Meeting
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="wizard" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Step indicator */}
                <div className="flex items-center justify-center gap-3 pt-7 pb-5 px-6 border-b border-[#1E293B]" data-testid="scheduler-steps">
                  {STEPS.map((s, idx) => (
                    <div key={s.id} className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
                          animate={{
                            backgroundColor: step >= s.id ? '#0EA5E9' : 'rgba(30,41,59,1)',
                            color: step >= s.id ? '#0F172A' : '#64748B',
                            borderColor: step >= s.id ? '#0EA5E9' : '#334155',
                          }}
                          transition={{ duration: 0.3 }}
                          style={{ border: '1px solid' }}
                        >
                          {step > s.id ? <Check size={14} /> : s.id}
                        </motion.div>
                        <span className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${step >= s.id ? 'text-[#F1F5F9]' : 'text-[#64748B]'}`}>
                          {s.label}
                        </span>
                      </div>
                      {idx < STEPS.length - 1 && (
                        <div className="w-8 sm:w-16 h-px bg-[#1E293B] relative overflow-hidden">
                          <motion.div
                            className="absolute inset-y-0 left-0 bg-[#0EA5E9]"
                            initial={false}
                            animate={{ width: step > s.id ? '100%' : '0%' }}
                            transition={{ duration: 0.4 }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="relative overflow-hidden">
                  <AnimatePresence mode="wait" custom={direction}>
                    {step === 1 ? (
                      <motion.div
                        key="step1"
                        custom={direction}
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="p-6 lg:p-8"
                      >
                        <div className="flex items-center gap-2 mb-6">
                          <CalendarIcon size={20} className="text-[#0EA5E9]" />
                          <h3 className="font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                            Select a Consultation Date &amp; Time
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div data-testid="calendar-container" className="flex justify-center">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              disabled={disabledDays}
                              className="rounded-sm border border-[#1E293B]"
                            />
                          </div>

                          <div>
                            {selectedDate ? (
                              <div data-testid="time-slots-container">
                                <div className="flex items-center gap-2 mb-4">
                                  <Clock size={16} className="text-[#0EA5E9]" />
                                  <span className="text-sm text-[#94A3B8]">
                                    Available times for {format(selectedDate, 'MMM dd, yyyy')}
                                  </span>
                                </div>

                                {isLoading ? (
                                  <div className="text-center text-[#94A3B8] py-4">Loading...</div>
                                ) : availableSlots.length > 0 ? (
                                  <div className="grid grid-cols-3 gap-2">
                                    {availableSlots.map((slot) => (
                                      <motion.button
                                        key={slot}
                                        type="button"
                                        data-testid={`time-slot-${slot}`}
                                        onClick={() => setSelectedTime(slot)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="relative py-2 px-3 rounded-sm text-sm font-mono overflow-hidden"
                                      >
                                        {selectedTime === slot && (
                                          <motion.span
                                            layoutId="time-slot-highlight"
                                            className="absolute inset-0 bg-[#0EA5E9]"
                                            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                                          />
                                        )}
                                        <span
                                          className={`relative z-10 transition-colors duration-150 ${
                                            selectedTime === slot ? 'text-[#0F172A]' : 'text-[#94A3B8]'
                                          }`}
                                        >
                                          {slot}
                                        </span>
                                        {selectedTime !== slot && (
                                          <span className="absolute inset-0 bg-[#1E293B] hover:bg-[#334155] -z-10 rounded-sm" />
                                        )}
                                      </motion.button>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-[#94A3B8] text-center py-4">
                                    No available slots for this date
                                  </p>
                                )}

                                <AnimatePresence>
                                  {selectedDate && selectedTime && (
                                    <motion.div
                                      data-testid="booking-summary"
                                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      exit={{ opacity: 0, y: -6 }}
                                      transition={{ duration: 0.3 }}
                                      className="mt-6 p-3 bg-[#1E293B] rounded-sm border border-[#0EA5E9]/40"
                                    >
                                      <p className="text-xs text-[#94A3B8] mb-1">Selected Time:</p>
                                      <p className="font-mono text-[#0EA5E9]">
                                        {format(selectedDate, 'EEEE, MMMM dd, yyyy')} at {selectedTime}
                                      </p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center text-center text-sm text-[#64748B] border border-dashed border-[#1E293B] rounded-sm py-10 px-4">
                                Pick a date on the calendar to see available time slots.
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end mt-8">
                          <motion.button
                            type="button"
                            data-testid="scheduler-continue-btn"
                            disabled={!canContinue}
                            onClick={() => canContinue && goToStep(2)}
                            className="btn-primary px-7 py-3 rounded-sm font-medium flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                            whileHover={canContinue ? { scale: 1.03 } : {}}
                            whileTap={canContinue ? { scale: 0.97 } : {}}
                          >
                            Continue
                            <ChevronRight size={18} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="step2"
                        custom={direction}
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="p-6 lg:p-8"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <User size={20} className="text-[#0EA5E9]" />
                            <h3 className="font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                              Your Details
                            </h3>
                          </div>
                          {selectedDate && selectedTime && (
                            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-[#0EA5E9] bg-[#1E293B] border border-[#334155] rounded-full px-3 py-1">
                              <Clock size={12} />
                              {format(selectedDate, 'MMM dd')} · {selectedTime}
                            </span>
                          )}
                        </div>

                        <form onSubmit={handleSubmit} data-testid="meeting-form" className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name" className="text-[#94A3B8] text-sm mb-2 flex items-center gap-2">
                                <User size={14} /> Name *
                              </Label>
                              <Input
                                id="name"
                                name="name"
                                data-testid="meeting-name-input"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Your full name"
                                required
                                className="bg-[#1E293B] border-[#334155] text-[#F8FAFC] placeholder:text-[#64748B]"
                              />
                            </div>

                            <div>
                              <Label htmlFor="email" className="text-[#94A3B8] text-sm mb-2 flex items-center gap-2">
                                <Mail size={14} /> Email *
                              </Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                data-testid="meeting-email-input"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="you@email.com"
                                required
                                className="bg-[#1E293B] border-[#334155] text-[#F8FAFC] placeholder:text-[#64748B]"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="company" className="text-[#94A3B8] text-sm mb-2 flex items-center gap-2">
                              <Building2 size={14} /> Company
                            </Label>
                            <Input
                              id="company"
                              name="company"
                              data-testid="meeting-company-input"
                              value={formData.company}
                              onChange={handleInputChange}
                              placeholder="Your company name"
                              className="bg-[#1E293B] border-[#334155] text-[#F8FAFC] placeholder:text-[#64748B]"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="service" className="text-[#94A3B8] text-sm mb-2 flex items-center gap-2">
                                <Briefcase size={14} /> Service Needed *
                              </Label>
                              <select
                                id="service"
                                name="service"
                                data-testid="meeting-service-input"
                                value={formData.service}
                                onChange={handleInputChange}
                                required
                                className={formData.service ? selectClass : selectEmptyClass}
                              >
                                <option value="" disabled>Select a service</option>
                                {SERVICE_OPTIONS.map(opt => (
                                  <option key={opt} value={opt} className="text-[#F8FAFC] bg-[#1E293B]">{opt}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <Label htmlFor="projectStage" className="text-[#94A3B8] text-sm mb-2 flex items-center gap-2">
                                <Layers size={14} /> Project Stage
                              </Label>
                              <select
                                id="projectStage"
                                name="projectStage"
                                data-testid="meeting-stage-input"
                                value={formData.projectStage}
                                onChange={handleInputChange}
                                className={formData.projectStage ? selectClass : selectEmptyClass}
                              >
                                <option value="">Select project stage</option>
                                {PROJECT_STAGE_OPTIONS.map(opt => (
                                  <option key={opt} value={opt} className="text-[#F8FAFC] bg-[#1E293B]">{opt}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="meetingFocus" className="text-[#94A3B8] text-sm mb-2 flex items-center gap-2">
                              <CalendarIcon size={14} /> Meeting Focus
                            </Label>
                            <select
                              id="meetingFocus"
                              name="meetingFocus"
                              data-testid="meeting-focus-input"
                              value={formData.meetingFocus}
                              onChange={handleInputChange}
                              className={formData.meetingFocus ? selectClass : selectEmptyClass}
                            >
                              <option value="">Select meeting focus</option>
                              {MEETING_FOCUS_OPTIONS.map(opt => (
                                <option key={opt} value={opt} className="text-[#F8FAFC] bg-[#1E293B]">{opt}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <Label htmlFor="notes" className="text-[#94A3B8] text-sm mb-2 flex items-center gap-2">
                              <FileText size={14} /> Project Notes *
                            </Label>
                            <Textarea
                              id="notes"
                              name="notes"
                              data-testid="meeting-notes-input"
                              value={formData.notes}
                              onChange={handleInputChange}
                              placeholder="Tell us about your project, BIM scope, disciplines involved, timeline, and required support..."
                              rows={3}
                              required
                              className="bg-[#1E293B] border-[#334155] text-[#F8FAFC] placeholder:text-[#64748B] resize-none"
                            />
                          </div>

                          <AnimatePresence>
                            {submitStatus && (
                              <motion.div
                                data-testid="submit-status"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2 p-3 rounded-sm bg-red-900/30 text-red-400"
                              >
                                <AlertCircle size={18} />
                                <span className="text-sm">{submitStatus.message}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex items-center gap-3 pt-2">
                            <motion.button
                              type="button"
                              data-testid="scheduler-back-btn"
                              onClick={() => goToStep(1)}
                              className="btn-outline px-5 py-3 rounded-sm font-medium flex items-center gap-1.5 text-sm"
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              <ChevronLeft size={16} />
                              Back
                            </motion.button>
                            <motion.button
                              type="submit"
                              data-testid="schedule-submit-btn"
                              disabled={isSubmitting}
                              className="flex-1 btn-primary py-3 rounded-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              whileHover={!isSubmitting ? { scale: 1.015 } : {}}
                              whileTap={!isSubmitting ? { scale: 0.985 } : {}}
                            >
                              {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
                            </motion.button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default MeetingScheduler;
