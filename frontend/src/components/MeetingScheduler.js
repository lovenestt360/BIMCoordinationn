import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, Mail, Building2, FileText, CheckCircle, AlertCircle, Briefcase, Layers, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { pt as ptLocale } from 'date-fns/locale';
import { Calendar } from '../components/ui/calendar';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { supabase } from '../lib/supabase';
import { format, addDays, isBefore, startOfToday } from 'date-fns';

const ALL_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

const selectTriggerClass = 'w-full h-auto bg-[#0B2A44] border-[rgba(255,255,255,0.1)] text-[#F7F9FB] px-3 py-2 text-sm data-[placeholder]:text-[rgba(247,249,251,0.55)] focus:ring-[#39C3FF] focus:ring-offset-0';
const selectContentClass = 'bg-[#0B2A44] border-[rgba(255,255,255,0.1)] text-[#F7F9FB]';
const selectItemClass = 'text-[rgba(247,249,251,0.8)] focus:bg-[#39C3FF]/10 focus:text-[#F7F9FB] cursor-pointer';

const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] } }),
};

const MeetingScheduler = () => {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language?.startsWith('pt') ? ptLocale : undefined;

  const SERVICE_OPTIONS = t('scheduler.serviceOptions', { returnObjects: true });
  const PROJECT_STAGE_OPTIONS = t('scheduler.stageOptions', { returnObjects: true });
  const MEETING_FOCUS_OPTIONS = t('scheduler.focusOptions', { returnObjects: true });
  const STEPS = [t('scheduler.step1'), t('scheduler.step2'), t('scheduler.step3')];

  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleSelectChange = (name) => (value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !formData.name || !formData.email || !formData.service || !formData.notes) {
      setSubmitStatus({ type: 'error', message: t('scheduler.errorRequired') });
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

      setSubmitStatus({
        type: 'success',
        message: t('scheduler.successMessage'),
      });
      setFormData({ name: '', email: '', company: '', service: '', projectStage: '', meetingFocus: '', notes: '' });
      setSelectedDate(null);
      setSelectedTime('');
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.message || t('scheduler.errorFallback'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabledDays = (date) => {
    const today = startOfToday();
    const maxDate = addDays(today, 60);
    return isBefore(date, today) || date > maxDate || date.getDay() === 0 || date.getDay() === 6;
  };

  const currentStep = submitStatus?.type === 'success' ? 2 : selectedDate && selectedTime ? 1 : 0;

  return (
    <section
      id="schedule"
      data-testid="schedule-section"
      className="py-28 lg:py-40 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0B2A44 0%, #04070B 100%)' }}
    >
      {/* Background Accent */}
      <div className="absolute inset-0 overflow-hidden blueprint-bg opacity-50" />
      <div
        className="absolute pointer-events-none"
        style={{ top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '70vw', height: '50vw', background: 'radial-gradient(ellipse, rgba(57,195,255,0.1) 0%, transparent 65%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-6" data-testid="schedule-label">{t('scheduler.eyebrow')}</p>
          <h2
            data-testid="schedule-title"
            className="font-instrument-serif text-5xl sm:text-6xl md:text-7xl leading-[1.02] text-white mb-6"
          >
            {t('scheduler.titlePrefix')} <span className="italic text-white/70">{t('scheduler.titleEmphasis')}</span>
          </h2>
          <p className="text-white/65 text-base md:text-lg font-light max-w-2xl mx-auto">
            {t('scheduler.subtitle')}
          </p>
        </motion.div>

        {/* Step Indicator */}
        <motion.div
          className="flex items-center justify-center gap-2 sm:gap-3 mb-10"
          data-testid="schedule-steps"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {STEPS.map((label, i) => {
            const isDone = i < currentStep;
            const isActive = i === currentStep;
            return (
              <div key={label} className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{
                      backgroundColor: isDone || isActive ? 'rgba(57,195,255,0.15)' : 'rgba(255,255,255,0.06)',
                      borderColor: isDone || isActive ? '#39C3FF' : 'rgba(255,255,255,0.1)',
                      scale: isActive ? 1.08 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-7 h-7 rounded-full border flex items-center justify-center font-mono text-xs font-bold flex-shrink-0"
                    style={{ color: isDone || isActive ? '#7DE0FF' : 'rgba(247,249,251,0.55)' }}
                  >
                    {isDone ? <Check size={13} /> : i + 1}
                  </motion.div>
                  <span
                    className="hidden sm:inline text-xs font-mono"
                    style={{ color: isDone || isActive ? 'rgba(247,249,251,0.8)' : 'rgba(247,249,251,0.55)' }}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-6 sm:w-10 h-px relative overflow-hidden bg-[#0B2A44]">
                    <motion.div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(90deg, #39C3FF, #7DE0FF)' }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: isDone ? 1 : 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>

        {/* Scheduler Card */}
        <motion.div
          data-testid="scheduler-card"
          className="glass rounded-sm max-w-4xl mx-auto overflow-hidden relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Ambient corner glow for extra depth */}
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full pointer-events-none" style={{
            background: 'radial-gradient(circle, rgba(57,195,255,0.1) 0%, transparent 70%)',
          }} />

          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Calendar Side */}
            <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-[#0B2A44]">
              <div className="flex items-center gap-2 mb-6">
                <CalendarIcon size={20} className="text-[#39C3FF]" />
                <h3
                  className="font-bold"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {t('scheduler.selectDate')}
                </h3>
              </div>

              <div data-testid="calendar-container" className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={disabledDays}
                  locale={dateLocale}
                  className="rounded-sm border border-[#0B2A44]"
                />
              </div>

              {/* Time Slots */}
              <AnimatePresence>
                {selectedDate && (
                  <motion.div
                    className="mt-6"
                    data-testid="time-slots-container"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="flex items-center gap-2 mb-4 pt-1">
                      <Clock size={16} className="text-[#39C3FF]" />
                      <span className="text-sm text-[rgba(247,249,251,0.65)]">
                        {t('scheduler.availableTimesFor', { date: format(selectedDate, 'MMM dd, yyyy', { locale: dateLocale }) })}
                      </span>
                    </div>

                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2 text-[rgba(247,249,251,0.65)] py-4">
                        <Loader2 size={16} className="animate-spin" />
                        {t('scheduler.loading')}
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot, i) => (
                          <motion.button
                            key={slot}
                            data-testid={`time-slot-${slot}`}
                            onClick={() => setSelectedTime(slot)}
                            custom={i}
                            variants={fieldVariants}
                            initial="hidden"
                            animate="show"
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            className={`py-2 px-3 rounded-sm text-sm font-mono transition-colors duration-200 ${
                              selectedTime === slot
                                ? 'bg-[#39C3FF] text-[#04070B]'
                                : 'bg-[#0B2A44] text-[rgba(247,249,251,0.65)] hover:bg-[rgba(255,255,255,0.1)]'
                            }`}
                          >
                            {slot}
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[rgba(247,249,251,0.65)] text-center py-4">
                        {t('scheduler.noSlots')}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Form Side */}
            <div className="p-6 lg:p-8">
              <div className="flex items-center gap-2 mb-6">
                <User size={20} className="text-[#39C3FF]" />
                <h3
                  className="font-bold"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {t('scheduler.yourDetails')}
                </h3>
              </div>

              <form onSubmit={handleSubmit} data-testid="meeting-form" className="space-y-4">
                {/* Name */}
                <div>
                  <Label htmlFor="name" className="text-[rgba(247,249,251,0.65)] text-sm mb-2 flex items-center gap-2">
                    <User size={14} /> {t('scheduler.labelName')}
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    data-testid="meeting-name-input"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('scheduler.placeholderName')}
                    required
                    className="bg-[#0B2A44] border-[rgba(255,255,255,0.1)] text-[#F7F9FB] placeholder:text-[rgba(247,249,251,0.55)]"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-[rgba(247,249,251,0.65)] text-sm mb-2 flex items-center gap-2">
                    <Mail size={14} /> {t('scheduler.labelEmail')}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    data-testid="meeting-email-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t('scheduler.placeholderEmail')}
                    required
                    className="bg-[#0B2A44] border-[rgba(255,255,255,0.1)] text-[#F7F9FB] placeholder:text-[rgba(247,249,251,0.55)]"
                  />
                </div>

                {/* Company */}
                <div>
                  <Label htmlFor="company" className="text-[rgba(247,249,251,0.65)] text-sm mb-2 flex items-center gap-2">
                    <Building2 size={14} /> {t('scheduler.labelCompany')}
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    data-testid="meeting-company-input"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder={t('scheduler.placeholderCompany')}
                    className="bg-[#0B2A44] border-[rgba(255,255,255,0.1)] text-[#F7F9FB] placeholder:text-[rgba(247,249,251,0.55)]"
                  />
                </div>

                {/* Service Needed */}
                <div>
                  <Label htmlFor="service" className="text-[rgba(247,249,251,0.65)] text-sm mb-2 flex items-center gap-2">
                    <Briefcase size={14} /> {t('scheduler.labelService')}
                  </Label>
                  <Select value={formData.service} onValueChange={handleSelectChange('service')}>
                    <SelectTrigger id="service" data-testid="meeting-service-input" className={selectTriggerClass}>
                      <SelectValue placeholder={t('scheduler.placeholderService')} />
                    </SelectTrigger>
                    <SelectContent className={selectContentClass}>
                      {SERVICE_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt} className={selectItemClass}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Project Stage */}
                <div>
                  <Label htmlFor="projectStage" className="text-[rgba(247,249,251,0.65)] text-sm mb-2 flex items-center gap-2">
                    <Layers size={14} /> {t('scheduler.labelStage')}
                  </Label>
                  <Select value={formData.projectStage} onValueChange={handleSelectChange('projectStage')}>
                    <SelectTrigger id="projectStage" data-testid="meeting-stage-input" className={selectTriggerClass}>
                      <SelectValue placeholder={t('scheduler.placeholderStage')} />
                    </SelectTrigger>
                    <SelectContent className={selectContentClass}>
                      {PROJECT_STAGE_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt} className={selectItemClass}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Meeting Focus */}
                <div>
                  <Label htmlFor="meetingFocus" className="text-[rgba(247,249,251,0.65)] text-sm mb-2 flex items-center gap-2">
                    <CalendarIcon size={14} /> {t('scheduler.labelFocus')}
                  </Label>
                  <Select value={formData.meetingFocus} onValueChange={handleSelectChange('meetingFocus')}>
                    <SelectTrigger id="meetingFocus" data-testid="meeting-focus-input" className={selectTriggerClass}>
                      <SelectValue placeholder={t('scheduler.placeholderFocus')} />
                    </SelectTrigger>
                    <SelectContent className={selectContentClass}>
                      {MEETING_FOCUS_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt} className={selectItemClass}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Project Notes */}
                <div>
                  <Label htmlFor="notes" className="text-[rgba(247,249,251,0.65)] text-sm mb-2 flex items-center gap-2">
                    <FileText size={14} /> {t('scheduler.labelNotes')}
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    data-testid="meeting-notes-input"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder={t('scheduler.placeholderNotes')}
                    rows={3}
                    required
                    className="bg-[#0B2A44] border-[rgba(255,255,255,0.1)] text-[#F7F9FB] placeholder:text-[rgba(247,249,251,0.55)] resize-none"
                  />
                </div>

                {/* Status Message */}
                {submitStatus && (
                  <div
                    data-testid="submit-status"
                    className={`flex items-center gap-2 p-3 rounded-sm ${
                      submitStatus.type === 'success'
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-red-900/30 text-red-400'
                    }`}
                  >
                    {submitStatus.type === 'success' ? (
                      <CheckCircle size={18} />
                    ) : (
                      <AlertCircle size={18} />
                    )}
                    <span className="text-sm">{submitStatus.message}</span>
                  </div>
                )}

                {/* Selected Summary */}
                <AnimatePresence>
                  {selectedDate && selectedTime && (
                    <motion.div
                      data-testid="booking-summary"
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-center gap-3 p-3 rounded-sm border border-[#39C3FF]/40"
                      style={{ background: 'linear-gradient(90deg, rgba(57,195,255,0.1), rgba(125,224,255,0.04))' }}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#39C3FF]/15 border border-[#39C3FF]/40 flex items-center justify-center flex-shrink-0">
                        <Check size={14} className="text-[#7DE0FF]" />
                      </div>
                      <div>
                        <p className="text-xs text-[rgba(247,249,251,0.65)] mb-0.5">{t('scheduler.selectedTime')}</p>
                        <p className="font-mono text-[#39C3FF] text-sm">
                          {format(selectedDate, 'EEEE, MMMM dd, yyyy', { locale: dateLocale })} {i18n.language?.startsWith('pt') ? 'às' : 'at'} {selectedTime}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div whileHover={{ scale: selectedDate && selectedTime ? 1.01 : 1 }} whileTap={{ scale: selectedDate && selectedTime ? 0.98 : 1 }}>
                  <Button
                    type="submit"
                    data-testid="schedule-submit-btn"
                    disabled={!selectedDate || !selectedTime || isSubmitting}
                    className="w-full btn-primary py-3 rounded-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {t('scheduler.submitLoading')}
                      </>
                    ) : (
                      t('scheduler.submitIdle')
                    )}
                  </Button>
                </motion.div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MeetingScheduler;
