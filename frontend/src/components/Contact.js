import { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle, MapPin, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { supabase } from '../lib/supabase';
import { getAttribution } from '../lib/attribution';
import { trackEvent } from '../lib/analytics';

const selectTriggerClass = 'w-full h-12 rounded-md bg-[#0B2233] border-[#39C3FF]/15 text-[#F7F9FB] px-3 text-sm data-[placeholder]:text-white/35 focus:ring-[#39C3FF] focus:ring-offset-0';
const selectContentClass = 'bg-[#0B2A44] border-white/10 text-[#F7F9FB]';
const selectItemClass = 'text-white/80 focus:bg-[#39C3FF]/10 focus:text-[#F7F9FB] cursor-pointer';

const Contact = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    support: '',
    message: '',
  });
  const supportOptions = t('scheduler.serviceOptions', { returnObjects: true });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSupportChange = (value) => {
    setFormData(prev => ({ ...prev, support: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setSubmitStatus({ type: 'error', message: t('contact.errorRequired') });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // The contact_messages table has no dedicated "support" or attribution
      // columns, so both are folded into the message body rather than
      // requiring a schema migration on the shared Supabase project.
      const attribution = getAttribution();
      const attributionLine = Object.keys(attribution).length
        ? `Source: ${Object.entries(attribution).map(([k, v]) => `${k}=${v}`).join(', ')}`
        : null;
      const composedMessage = [
        formData.support ? `Support needed: ${formData.support}` : null,
        formData.message || null,
        attributionLine,
      ].filter(Boolean).join('\n\n');

      const { error } = await supabase.from('contact_messages').insert([{
        name: formData.name,
        email: formData.email,
        company: formData.company || null,
        message: composedMessage,
      }]);

      if (error) throw error;

      trackEvent('contact_submit', { location: 'contact_section' });
      setSubmitStatus({
        type: 'success',
        message: t('contact.successMessage'),
      });
      setFormData({ name: '', email: '', company: '', support: '', message: '' });
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
      className="py-20 lg:py-28 relative overflow-hidden"
    >
      <div className="absolute pointer-events-none" style={{
        bottom: '-10%', right: '-5%',
        width: '700px', height: '700px',
        background: 'radial-gradient(circle, rgba(57,195,255,0.10) 0%, transparent 70%)',
      }} />

      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div className="mb-12 max-w-3xl">
          <span className="text-[#39C3FF] text-xs font-medium tracking-[0.22em] uppercase mb-5 block" data-testid="contact-label">{t('contact.eyebrow')}</span>
          <h2
            data-testid="contact-title"
            className="font-instrument-serif text-4xl sm:text-5xl md:text-6xl leading-[1.02] text-white mb-5"
          >
            {t('contact.titlePrefix')} <span className="italic text-[#39C3FF]">{t('contact.titleEmphasis')}</span>
          </h2>
          <p className="text-white/65 text-base sm:text-lg font-light leading-relaxed max-w-xl">
            {t('contact.subtitle')}
          </p>
        </div>

        <div data-testid="contact-layout" className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-stretch">
          {/* Contact Info */}
          <div data-motion-card data-testid="contact-info-panel" className="lg:col-span-4 divide-y divide-[#39C3FF]/15 rounded-xl border border-[#39C3FF]/20 bg-[#071723]/80 overflow-hidden">
            {/* Email Card */}
            <div
              data-testid="contact-email-card"
              className="p-6 transition-colors duration-200 hover:bg-[#39C3FF]/[0.045]"
            >
              <div className="w-10 h-10 rounded-md border border-white/15 bg-white/[0.04] flex items-center justify-center mb-4">
                <Mail size={20} className="text-[#39C3FF]" />
              </div>
              <h3 className="font-instrument-serif text-xl text-white mb-2">
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
              className="p-6 transition-colors duration-200 hover:bg-[#39C3FF]/[0.045]"
            >
              <div className="w-10 h-10 rounded-md border border-white/15 bg-white/[0.04] flex items-center justify-center mb-4">
                <MapPin size={20} className="text-[#7DE0FF]" />
              </div>
              <h3 className="font-instrument-serif text-xl text-white mb-2">
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
              className="p-6 transition-colors duration-200 hover:bg-[#39C3FF]/[0.045]"
            >
              <div className="w-10 h-10 rounded-md border border-white/15 bg-white/[0.04] flex items-center justify-center mb-4">
                <Phone size={20} className="text-[#39C3FF]" />
              </div>
              <h3 className="font-instrument-serif text-xl text-white mb-2">
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
            className="lg:col-span-8 rounded-xl border border-[#39C3FF]/20 bg-[#071723]/80 p-6 sm:p-8 lg:p-9"
          >
            <div className="flex items-center justify-between gap-5 mb-7">
            <h3 className="font-instrument-serif text-3xl text-white">
              {t('contact.formTitle')}
            </h3>
              <span className="hidden sm:block h-px w-24 bg-gradient-to-r from-[#39C3FF] to-transparent" />
            </div>

            <form onSubmit={handleSubmit} data-testid="contact-form" className="space-y-4">
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
                    className="h-12 rounded-md bg-[#0B2233] border-[#39C3FF]/15 text-[#F7F9FB] placeholder:text-white/35 focus-visible:border-[#39C3FF]/60"
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
                    className="h-12 rounded-md bg-[#0B2233] border-[#39C3FF]/15 text-[#F7F9FB] placeholder:text-white/35 focus-visible:border-[#39C3FF]/60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    className="h-12 rounded-md bg-[#0B2233] border-[#39C3FF]/15 text-[#F7F9FB] placeholder:text-white/35 focus-visible:border-[#39C3FF]/60"
                  />
                </div>

                <div>
                  <Label htmlFor="contact-support" className="text-[rgba(247,249,251,0.65)] text-sm mb-2 block">
                    {t('contact.labelSupport')}
                  </Label>
                  <Select value={formData.support} onValueChange={handleSupportChange}>
                    <SelectTrigger id="contact-support" data-testid="contact-support-select" className={selectTriggerClass}>
                      <SelectValue placeholder={t('contact.placeholderSupport')} />
                    </SelectTrigger>
                    <SelectContent className={selectContentClass}>
                      {supportOptions.map((option) => (
                        <SelectItem key={option} value={option} className={selectItemClass}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                  rows={4}
                  className="rounded-md bg-[#0B2233] border-[#39C3FF]/15 text-[#F7F9FB] placeholder:text-white/35 focus-visible:border-[#39C3FF]/60 resize-none"
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
                className="contact-action btn-primary min-w-56 px-8 py-4 rounded-md font-semibold flex items-center justify-center gap-3 disabled:opacity-50"
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
