import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { MSC_ORGANIZATION } from '../../constants';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+254 790 629439',
  defaultMessage = 'Hello Mwancha Senior Community (MSC), I would like to inquire about your programs and support services.'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Clean phone number (digits only)
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(defaultMessage);
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

  return (
    <aside
      aria-label="Direct WhatsApp Communication"
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 print:hidden"
    >
      {/* Interactive Micro-Popup when opened */}
      {isOpen && (
        <div
          role="dialog"
          aria-labelledby="whatsapp-chat-title"
          className="bg-white rounded-2xl shadow-2xl border border-forest-100 p-4 w-72 sm:w-80 transition-all transform animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-warm-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-forest-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                MSC
              </div>
              <div>
                <h3 id="whatsapp-chat-title" className="text-sm font-semibold text-charcoal-900 leading-tight">
                  {MSC_ORGANIZATION.shortName} Helpdesk
                </h3>
                <p className="text-xs text-forest-600 flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Official Community Support
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close WhatsApp chat popup"
              className="p-1 rounded-full text-warm-500 hover:text-charcoal-800 hover:bg-warm-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-charcoal-600 py-3 leading-relaxed">
            Need urgent assistance, elder welfare consultations, or want to partner with Mwancha Senior Community? Chat directly with our community coordination desk.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <MessageCircle className="w-4 h-4" />
            Start WhatsApp Chat
          </a>
        </div>
      )}

      {/* Main Trigger Button */}
      <div className="relative group flex items-center">
        {/* Tooltip on hover when popup closed */}
        {!isOpen && (
          <span
            className="hidden sm:block absolute right-16 px-3 py-1.5 bg-forest-950 text-warm-50 text-xs font-medium rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          >
            Chat with MSC on WhatsApp
          </span>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close WhatsApp contact prompt" : "Open WhatsApp direct chat with MSC"}
          className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-400/40 relative"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              {/* Ripple Effect */}
              <span className="absolute -inset-1 rounded-full bg-emerald-400 opacity-25 animate-ping"></span>
              {/* WhatsApp Icon */}
              <svg
                className="w-7 h-7 fill-current relative z-10"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
