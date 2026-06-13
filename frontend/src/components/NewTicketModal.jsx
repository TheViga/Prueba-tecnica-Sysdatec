import { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import { btnPrimary, btnSubtle, inputBase, fieldLabel, banner } from '../lib/ui.js';

const fieldError = 'text-high text-xs mt-1.5';

export default function NewTicketModal({ onClose, onCreate }) {
  const [customerName, setCustomerName] = useState('');
  const [requestText, setRequestText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function validate() {
    const next = {};
    if (!customerName.trim()) next.customerName = 'Customer name is required.';
    if (!requestText.trim()) next.requestText = 'Describe the request.';
    if (attachmentUrl.trim() && !/^https?:\/\/.+/i.test(attachmentUrl.trim())) {
      next.attachmentUrl = 'Must be a valid URL (http/https).';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await onCreate({
        customerName: customerName.trim(),
        requestText: requestText.trim(),
        attachmentUrl: attachmentUrl.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-6">
      <div
        className="fixed inset-0 bg-[rgba(20,18,30,0.42)] backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div
        className="relative z-[61] w-[min(560px,100%)] max-h-[calc(100vh-48px)] overflow-auto bg-canvas rounded-[18px] shadow-lg animate-pop"
        role="dialog"
        aria-modal="true"
        aria-label="New ticket"
      >
        <div className="flex items-start px-6 pt-[22px] pb-1">
          <div>
            <h2 className="text-[20px]">New ticket</h2>
            <p className="mt-1 text-[13px] text-ink-soft">
              It’s triaged automatically the moment you submit.
            </p>
          </div>
          <button
            className="ml-auto w-[34px] h-[34px] rounded-[9px] grid place-items-center text-ink-soft flex-none transition-colors hover:bg-surface-soft"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="px-6 py-[18px] flex flex-col gap-4">
            {submitError && (
              <div className={banner}>
                <Icon name="alert" size={16} className="flex-none" />
                {submitError}
              </div>
            )}

            <div>
              <label htmlFor="nt-name" className={fieldLabel}>
                Customer name
              </label>
              <input
                id="nt-name"
                className={inputBase}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Acme Corp — Jane Doe"
                autoFocus
              />
              {errors.customerName && <div className={fieldError}>{errors.customerName}</div>}
            </div>

            <div>
              <label htmlFor="nt-request" className={fieldLabel}>
                Request
              </label>
              <textarea
                id="nt-request"
                className={`${inputBase} resize-y min-h-[120px] leading-relaxed`}
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                placeholder="Describe what the customer needs…"
                rows={5}
              />
              {errors.requestText && <div className={fieldError}>{errors.requestText}</div>}
            </div>

            <div>
              <label htmlFor="nt-url" className={fieldLabel}>
                Attachment URL (optional)
              </label>
              <input
                id="nt-url"
                className={inputBase}
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder="https://…"
              />
              {errors.attachmentUrl && <div className={fieldError}>{errors.attachmentUrl}</div>}
            </div>

            <div className="flex items-center gap-2 text-[12.5px] text-ink-soft bg-accent-soft rounded-field px-3 py-2.5">
              <Icon name="sparkles" size={16} className="text-accent flex-none" />
              Category, priority and a summary are filled in for you by AI triage.
            </div>
          </div>

          <div className="flex justify-end gap-2.5 px-6 pt-4 pb-[22px]">
            <button type="button" className={btnSubtle} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={btnPrimary} disabled={submitting}>
              {submitting ? (
                <>
                  <Icon name="refresh" size={15} className="animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Icon name="plus" size={15} />
                  Create ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
