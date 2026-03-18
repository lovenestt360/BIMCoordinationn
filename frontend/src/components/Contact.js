import { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle, MapPin, Phone } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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
      const response = await axios.post(`${API}/contact`, formData);

      if (response.data.success) {
        setSubmitStatus({ 
          type: 'success', 
          message: 'Message sent successfully! We will get back to you soon.' 
        });
        setFormData({ name: '', email: '', company: '', message: '' });
      }
    } catch (error) {
      setSubmitStatus({ 
        type: 'error', 
        message: error.response?.data?.detail || 'Failed to send message. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      data-testid="contact-section"
      className="py-24 lg:py-32 blueprint-bg relative"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-16">
          <p className="text-[#0EA5E9] font-mono text-sm mb-2" data-testid="contact-label">// CONTACT</p>
          <h2 
            data-testid="contact-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Get in <span className="text-[#0EA5E9]">Touch</span>
          </h2>
          <p className="text-[#94A3B8] max-w-2xl">
            Have a project in mind? Send us a message and let's discuss how we can help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            {/* Email Card */}
            <div 
              data-testid="contact-email-card"
              className="tech-card rounded-sm bg-[#0F172A] p-6"
            >
              <div className="w-12 h-12 rounded-sm bg-[#1E293B] flex items-center justify-center mb-4">
                <Mail size={24} className="text-[#0EA5E9]" />
              </div>
              <h3 
                className="font-bold mb-2"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Email Us
              </h3>
              <a 
                href="mailto:contact@klyronconsulting.com" 
                className="text-[#0EA5E9] hover:text-[#22D3EE] transition-colors text-sm"
              >
                contact@klyronconsulting.com
              </a>
            </div>

            {/* Location Card */}
            <div 
              data-testid="contact-location-card"
              className="tech-card rounded-sm bg-[#0F172A] p-6"
            >
              <div className="w-12 h-12 rounded-sm bg-[#1E293B] flex items-center justify-center mb-4">
                <MapPin size={24} className="text-[#22D3EE]" />
              </div>
              <h3 
                className="font-bold mb-2"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Location
              </h3>
              <p className="text-[#94A3B8] text-sm">
                Operating Worldwide<br />
                Remote BIM Services
              </p>
            </div>

            {/* Response Time */}
            <div 
              data-testid="contact-response-card"
              className="tech-card rounded-sm bg-[#0F172A] p-6"
            >
              <div className="w-12 h-12 rounded-sm bg-[#1E293B] flex items-center justify-center mb-4">
                <Phone size={24} className="text-[#0EA5E9]" />
              </div>
              <h3 
                className="font-bold mb-2"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Response Time
              </h3>
              <p className="text-[#94A3B8] text-sm">
                Usually within 24 hours<br />
                <span className="text-[#22D3EE]">Priority for scheduled calls</span>
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div 
            data-testid="contact-form-container"
            className="lg:col-span-2 tech-card rounded-sm bg-[#0F172A] p-6 lg:p-8"
          >
            <h3 
              className="text-xl font-bold mb-6"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Send a Message
            </h3>

            <form onSubmit={handleSubmit} data-testid="contact-form" className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="contact-name" className="text-[#94A3B8] text-sm mb-2 block">
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
                    className="bg-[#1E293B] border-[#334155] text-[#F8FAFC] placeholder:text-[#64748B]"
                  />
                </div>

                <div>
                  <Label htmlFor="contact-email" className="text-[#94A3B8] text-sm mb-2 block">
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
                    className="bg-[#1E293B] border-[#334155] text-[#F8FAFC] placeholder:text-[#64748B]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contact-company" className="text-[#94A3B8] text-sm mb-2 block">
                  Company
                </Label>
                <Input
                  id="contact-company"
                  name="company"
                  data-testid="contact-company-input"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Your company name"
                  className="bg-[#1E293B] border-[#334155] text-[#F8FAFC] placeholder:text-[#64748B]"
                />
              </div>

              <div>
                <Label htmlFor="contact-message" className="text-[#94A3B8] text-sm mb-2 block">
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
                  className="bg-[#1E293B] border-[#334155] text-[#F8FAFC] placeholder:text-[#64748B] resize-none"
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
                className="btn-primary px-8 py-3 rounded-sm font-medium flex items-center gap-2 disabled:opacity-50"
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
