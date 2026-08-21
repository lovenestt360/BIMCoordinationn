import { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle, MapPin, Phone } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { supabase } from '../lib/supabase';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const { error } = await supabase.from('contact_messages').insert([{
        name: formData.name,
        email: formData.email,
        company: formData.company || null,
        message: formData.message,
      }]);

      if (error) throw error;

      setSubmitStatus({
        type: 'success',
        message: 'Message sent successfully! We will get back to you soon.',
      });
      setFormData({ name: '', email: '', company: '', message: '' });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Failed to send message. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      data-testid="contact-section"
      className="min-h-screen flex flex-col justify-center py-28 lg:py-40 blueprint-bg relative overflow-hidden"
    >
      <div className="absolute pointer-events-none" style={{
        bottom: '-10%', right: '-5%',
        width: '700px', height: '700px',
        background: 'radial-gradient(circle, rgba(57,195,255,0.10) 0%, transparent 70%)',
      }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="mb-20 max-w-3xl">
          <span className="text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-6 block" data-testid="contact-label">Contact</span>
          <h2
            data-testid="contact-title"
            className="font-instrument-serif text-5xl sm:text-6xl md:text-7xl leading-[1.02] text-white mb-6"
          >
            Let's discuss your <span className="italic text-[#39C3FF]">project</span>
          </h2>
          <p className="text-white/65 text-base sm:text-lg font-light leading-relaxed max-w-xl">
            Whether you need BIM coordination, clash detection, model validation, or digital delivery support, share your project details and we'll get back to you with the next steps.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-5">
            {/* Email Card */}
            <div
              data-testid="contact-email-card"
              className="rounded-sm border border-white/10 bg-white/[0.03] p-7 transition-colors duration-300 hover:border-[#39C3FF]/40"
            >
              <div className="w-11 h-11 rounded-sm bg-[#39C3FF]/10 flex items-center justify-center mb-5">
                <Mail size={20} className="text-[#39C3FF]" />
              </div>
              <h3 className="font-instrument-serif text-2xl text-white mb-2">
                Email Us
              </h3>
              <a
                href="mailto:contact@klyronconsulting.com"
                className="text-[#39C3FF] hover:text-[#7DE0FF] transition-colors text-sm block mb-2"
              >
                contact@klyronconsulting.com
              </a>
              <p className="text-white/55 text-sm font-light">For BIM coordination requests, proposals, and project enquiries.</p>
            </div>

            {/* Location Card */}
            <div
              data-testid="contact-location-card"
              className="rounded-sm border border-white/10 bg-white/[0.03] p-7 transition-colors duration-300 hover:border-[#39C3FF]/40"
            >
              <div className="w-11 h-11 rounded-sm bg-[#39C3FF]/10 flex items-center justify-center mb-5">
                <MapPin size={20} className="text-[#7DE0FF]" />
              </div>
              <h3 className="font-instrument-serif text-2xl text-white mb-2">
                Location
              </h3>
              <p className="text-white/55 text-sm font-light leading-relaxed">
                Operating Worldwide<br />
                Remote BIM coordination and digital delivery support for international project teams.
              </p>
            </div>

            {/* Response Time */}
            <div
              data-testid="contact-response-card"
              className="rounded-sm border border-white/10 bg-white/[0.03] p-7 transition-colors duration-300 hover:border-[#39C3FF]/40"
            >
              <div className="w-11 h-11 rounded-sm bg-[#39C3FF]/10 flex items-center justify-center mb-5">
                <Phone size={20} className="text-[#39C3FF]" />
              </div>
              <h3 className="font-instrument-serif text-2xl text-white mb-2">
                Response Time
              </h3>
              <p className="text-white/55 text-sm font-light leading-relaxed">
                Usually within 24 hours<br />
                <span className="text-[#7DE0FF]">Priority response for scheduled calls and urgent project reviews.</span>
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div
            data-testid="contact-form-container"
            className="lg:col-span-2 rounded-sm border border-white/10 bg-white/[0.03] p-7 lg:p-10"
          >
            <h3 className="font-instrument-serif text-3xl text-white mb-8">
              Send a Message
            </h3>

            <form onSubmit={handleSubmit} data-testid="contact-form" className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="contact-name" className="text-[rgba(247,249,251,0.65)] text-sm mb-2 block">
                    Name *
                  </Label>
                  <Input
                    id="contact-name"
                    name="name"
                    data-testid="contact-name-input"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    required
                    className="bg-white/[0.04] border-white/10 text-[#F7F9FB] placeholder:text-white/40 focus-visible:border-[#39C3FF]/50"
                  />
                </div>

                <div>
                  <Label htmlFor="contact-email" className="text-[rgba(247,249,251,0.65)] text-sm mb-2 block">
                    Email *
                  </Label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    data-testid="contact-email-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                    className="bg-white/[0.04] border-white/10 text-[#F7F9FB] placeholder:text-white/40 focus-visible:border-[#39C3FF]/50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contact-company" className="text-[rgba(247,249,251,0.65)] text-sm mb-2 block">
                  Company
                </Label>
                <Input
                  id="contact-company"
                  name="company"
                  data-testid="contact-company-input"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Your company name"
                  className="bg-[#0B2A44] border-[rgba(255,255,255,0.1)] text-[#F7F9FB] placeholder:text-[rgba(247,249,251,0.55)]"
                />
              </div>

              <div>
                <Label htmlFor="contact-message" className="text-[rgba(247,249,251,0.65)] text-sm mb-2 block">
                  Message *
                </Label>
                <Textarea
                  id="contact-message"
                  name="message"
                  data-testid="contact-message-input"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us about your project, timeline, and any specific requirements..."
                  rows={5}
                  required
                  className="bg-white/[0.04] border-white/10 text-[#F7F9FB] placeholder:text-white/40 focus-visible:border-[#39C3FF]/50 resize-none"
                />
              </div>

              {/* Status Message */}
              {submitStatus && (
                <div
                  data-testid="contact-submit-status"
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

              <Button
                type="submit"
                data-testid="contact-submit-btn"
                disabled={isSubmitting}
                className="btn-primary px-9 py-4 rounded-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    Send Message
                    <Send size={18} />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
