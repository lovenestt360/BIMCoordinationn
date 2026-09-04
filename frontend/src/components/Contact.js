import { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle, MapPin, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { supabase } from '../lib/supabase';

const Contact = () => {
  const { t } = useTranslation();
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
      setSubmitStatus({ type: 'error', message: t('contact.errorRequired') });
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
        message: t('contact.successMessage'),
      });
      setFormData({ name: '', email: '', company: '', message: '' });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.message || t('contact.errorFallback'),
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
          <span className="text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-6 block" data-testid="contact-label">{t('contact.eyebrow')}</span>
          <h2
            data-testid="contact-title"
            className="font-instrument-serif text-5xl sm:text-6xl md:text-7xl leading-[1.02] text-white mb-6"
          >
            {t('contact.titlePrefix')} <span className="italic text-[#39C3FF]">{t('contact.titleEmphasis')}</span>
          </h2>
          <p className="text-white/65 text-base sm:text-lg font-light leading-relaxed max-w-xl">
            {t('contact.subtitle')}
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
                {t('contact.emailCardTitle')}
              </h3>
              <a
                href="mailto:contact@klyronconsulting.com"
                className="text-[#39C3FF] hover:text-[#7DE0FF] transition-colors text-sm block mb-2"
              >
                contact@klyronconsulting.com
              </a>
              <p className="text-white/55 text-sm font-light">{t('contact.emailCardBody')}</p>
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
                {t('contact.locationCardTitle')}
              </h3>
              <p className="text-white/55 text-sm font-light leading-relaxed">
                {t('contact.locationCardBody')}<br />
                {t('contact.locationCardBody2')}
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
                {t('contact.responseCardTitle')}
              </h3>
              <p className="text-white/55 text-sm font-light leading-relaxed">
                {t('contact.responseCardBody')}<br />
                <span className="text-[#7DE0FF]">{t('contact.responseCardBody2')}</span>
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div
            data-testid="contact-form-container"
            className="lg:col-span-2 rounded-sm border border-white/10 bg-white/[0.03] p-7 lg:p-10"
          >
            <h3 className="font-instrument-serif text-3xl text-white mb-8">
              {t('contact.formTitle')}
            </h3>

            <form onSubmit={handleSubmit} data-testid="contact-form" className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="contact-name" className="text-[rgba(247,249,251,0.65)] text-sm mb-2 block">
                    {t('contact.labelName')}
                  </Label>
                  <Input
                    id="contact-name"
                    name="name"
                    data-testid="contact-name-input"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('contact.placeholderName')}
                    required
                    className="bg-white/[0.04] border-white/10 text-[#F7F9FB] placeholder:text-white/40 focus-visible:border-[#39C3FF]/50"
                  />
                </div>

                <div>
                  <Label htmlFor="contact-email" className="text-[rgba(247,249,251,0.65)] text-sm mb-2 block">
                    {t('contact.labelEmail')}
                  </Label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    data-testid="contact-email-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t('contact.placeholderEmail')}
                    required
                    className="bg-white/[0.04] border-white/10 text-[#F7F9FB] placeholder:text-white/40 focus-visible:border-[#39C3FF]/50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contact-company" className="text-[rgba(247,249,251,0.65)] text-sm mb-2 block">
                  {t('contact.labelCompany')}
                </Label>
                <Input
                  id="contact-company"
                  name="company"
                  data-testid="contact-company-input"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder={t('contact.placeholderCompany')}
                  className="bg-white/[0.04] border-white/10 text-[#F7F9FB] placeholder:text-white/40 focus-visible:border-[#39C3FF]/50"
                />
              </div>

              <div>
                <Label htmlFor="contact-message" className="text-[rgba(247,249,251,0.65)] text-sm mb-2 block">
                  {t('contact.labelMessage')}
                </Label>
                <Textarea
                  id="contact-message"
                  name="message"
                  data-testid="contact-message-input"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder={t('contact.placeholderMessage')}
                  rows={5}
                  required
                  className="bg-white/[0.04] border-white/10 text-[#F7F9FB] placeholder:text-white/40 focus-visible:border-[#39C3FF]/50 resize-none"
                />
              </div>

              {/* Status Message */}
              {submitStatus && (
                <div
                  data-testid="contact-submit-status"
                  className="flex items-center gap-2 p-3 rounded-sm border"
                  style={
                    submitStatus.type === 'success'
                      ? { background: 'rgba(67,209,122,0.1)', borderColor: 'rgba(67,209,122,0.35)', color: '#43D17A' }
                      : { background: 'rgba(255,122,26,0.1)', borderColor: 'rgba(255,122,26,0.35)', color: '#FF7A1A' }
                  }
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
                  t('contact.submitLoading')
                ) : (
                  <>
                    {t('contact.submitIdle')}
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
