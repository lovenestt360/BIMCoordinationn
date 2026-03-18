import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, Mail, Building2, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Calendar } from '../components/ui/calendar';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import axios from 'axios';
import { format, addDays, isBefore, startOfToday } from 'date-fns';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MeetingScheduler = () => {
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
    notes: '',
  });

  // Fetch available slots when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(format(selectedDate, 'yyyy-MM-dd'));
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async (date) => {
    setIsLoading(true);
    setSelectedTime('');
    try {
      const response = await axios.get(`${API}/available-slots?date=${date}`);
      setAvailableSlots(response.data.available_slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAvailableSlots(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !formData.name || !formData.email) {
      setSubmitStatus({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await axios.post(`${API}/meetings`, {
        ...formData,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      if (response.data.success) {
        setSubmitStatus({ 
          type: 'success', 
          message: 'Meeting scheduled successfully! You will receive a confirmation email shortly.' 
        });
        // Reset form
        setFormData({ name: '', email: '', company: '', notes: '' });
        setSelectedDate(null);
        setSelectedTime('');
      }
    } catch (error) {
      setSubmitStatus({ 
        type: 'error', 
        message: error.response?.data?.detail || 'Failed to schedule meeting. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Disable past dates and weekends
  const disabledDays = (date) => {
    const today = startOfToday();
    const maxDate = addDays(today, 60);
    return isBefore(date, today) || date > maxDate || date.getDay() === 0 || date.getDay() === 6;
  };

  return (
    <section
      id="schedule"
      data-testid="schedule-section"
      className="py-24 lg:py-32 bg-[#0F172A] relative"
    >
      {/* Background Accent */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1766802981801-4b4a9a1d8f1c?crop=entropy&cs=srgb&fm=jpg&q=85)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="mb-16 text-center">
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
        </div>

        {/* Scheduler Card */}
        <div 
          data-testid="scheduler-card"
          className="glass rounded-sm max-w-4xl mx-auto overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Calendar Side */}
            <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-[#1E293B]">
              <div className="flex items-center gap-2 mb-6">
                <CalendarIcon size={20} className="text-[#0EA5E9]" />
                <h3 
                  className="font-bold"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Select a Date
                </h3>
              </div>

              <div data-testid="calendar-container" className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={disabledDays}
                  className="rounded-sm border border-[#1E293B]"
                />
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="mt-6" data-testid="time-slots-container">
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
                        <button
                          key={slot}
                          data-testid={`time-slot-${slot}`}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2 px-3 rounded-sm text-sm font-mono transition-all duration-200 ${
                            selectedTime === slot
                              ? 'bg-[#0EA5E9] text-[#0F172A]'
                              : 'bg-[#1E293B] text-[#94A3B8] hover:bg-[#334155]'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#94A3B8] text-center py-4">
                      No available slots for this date
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Form Side */}
            <div className="p-6 lg:p-8">
              <div className="flex items-center gap-2 mb-6">
                <User size={20} className="text-[#0EA5E9]" />
                <h3 
                  className="font-bold"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Your Details
                </h3>
              </div>

              <form onSubmit={handleSubmit} data-testid="meeting-form" className="space-y-4">
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
                    placeholder="your@email.com"
                    required
                    className="bg-[#1E293B] border-[#334155] text-[#F8FAFC] placeholder:text-[#64748B]"
                  />
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

                <div>
                  <Label htmlFor="notes" className="text-[#94A3B8] text-sm mb-2 flex items-center gap-2">
                    <FileText size={14} /> Project Notes
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    data-testid="meeting-notes-input"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Briefly describe your project or questions..."
                    rows={3}
                    className="bg-[#1E293B] border-[#334155] text-[#F8FAFC] placeholder:text-[#64748B] resize-none"
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
                {selectedDate && selectedTime && (
                  <div 
                    data-testid="booking-summary"
                    className="p-3 bg-[#1E293B] rounded-sm border border-[#334155]"
                  >
                    <p className="text-xs text-[#94A3B8] mb-1">Selected Time:</p>
                    <p className="font-mono text-[#0EA5E9]">
                      {format(selectedDate, 'EEEE, MMMM dd, yyyy')} at {selectedTime}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  data-testid="schedule-submit-btn"
                  disabled={!selectedDate || !selectedTime || isSubmitting}
                  className="w-full btn-primary py-3 rounded-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetingScheduler;
