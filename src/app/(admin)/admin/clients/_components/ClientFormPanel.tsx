import type { NdisPricing } from '@/db/schema/ndis_pricing';
import type { Client } from '@/db/schema/clients';
import { colors, radii, typography, formStyles } from '@/styles/botanical';
import {
  CLIENT_PANEL,
  ClientPanelHeader,
  clientPanelBtnLabel,
  clientPanelContentScroll,
  clientPanelPrimaryFlexible,
  clientPanelSecondaryCompact,
} from './clientPanelShared';

interface ClientFormPanelProps {
  mode: 'new' | 'edit';
  client?: Client;
  pricingCodes: NdisPricing[];
  loadingPricingCodes: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  formData: {
    name: string;
    email: string;
    phone: string;
    ndis_number: string;
    address: string;
    suburb: string;
    weekday_code: string;
    saturday_code: string;
    sunday_code: string;
  };
  setFormData: (data: any) => void;
}

export function ClientFormPanel({
  mode,
  client,
  pricingCodes,
  loadingPricingCodes,
  onClose,
  onSubmit,
  saving,
  formData,
  setFormData,
}: ClientFormPanelProps) {
  return (
    <>
      <ClientPanelHeader
        title={mode === 'new' ? 'Add Client' : 'Edit Client'}
        onClose={onClose}
      />
      <div style={clientPanelContentScroll}>
        <form onSubmit={onSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <FormField label="Name *">
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                style={inputStyle}
                placeholder="Enter client name"
              />
            </FormField>

            <FormField label="Email *">
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
                style={inputStyle}
                placeholder="client@example.com"
              />
            </FormField>

            <FormField label="Phone">
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                style={inputStyle}
                placeholder="0412 345 678"
              />
            </FormField>

            <FormField label="NDIS Number">
              <input
                type="text"
                id="ndis_number"
                value={formData.ndis_number}
                onChange={e => setFormData({ ...formData, ndis_number: e.target.value })}
                style={inputStyle}
                placeholder="123 456 789"
              />
            </FormField>

            <FormField label="Address">
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                style={inputStyle}
                placeholder="123 Main Street"
              />
            </FormField>

            <FormField label="Suburb">
              <input
                type="text"
                id="suburb"
                value={formData.suburb}
                onChange={e => setFormData({ ...formData, suburb: e.target.value })}
                style={inputStyle}
                placeholder="Sydney"
              />
            </FormField>

            <div style={{ height: 1, background: colors.primary, margin: '0.5rem 0' }} />

            <FormField label="Weekday Rate Code">
              <select
                value={formData.weekday_code}
                onChange={e => setFormData({ ...formData, weekday_code: e.target.value })}
                disabled={loadingPricingCodes}
                style={selectStyle}
              >
                <option value="">Select a pricing code...</option>
                {pricingCodes.map(code => (
                  <option key={code.id} value={code.support_item_code}>
                    {code.support_item_code} — {code.support_item_name} (${code.national_price}/{code.unit})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Saturday Rate Code">
              <select
                value={formData.saturday_code}
                onChange={e => setFormData({ ...formData, saturday_code: e.target.value })}
                disabled={loadingPricingCodes}
                style={selectStyle}
              >
                <option value="">Select a pricing code...</option>
                {pricingCodes.map(code => (
                  <option key={code.id} value={code.support_item_code}>
                    {code.support_item_code} — {code.support_item_name} (${code.national_price}/{code.unit})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Sunday Rate Code">
              <select
                value={formData.sunday_code}
                onChange={e => setFormData({ ...formData, sunday_code: e.target.value })}
                disabled={loadingPricingCodes}
                style={selectStyle}
              >
                <option value="">Select a pricing code...</option>
                {pricingCodes.map(code => (
                  <option key={code.id} value={code.support_item_code}>
                    {code.support_item_code} — {code.support_item_name} (${code.national_price}/{code.unit})
                  </option>
                ))}
              </select>
            </FormField>

            <div
              style={{
                padding: '0.6rem 0.85rem',
                borderRadius: radii.button,
                background: 'rgba(182,148,112,0.08)',
                border: '1px solid rgba(182,148,112,0.2)',
                marginTop: '0.3rem',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '0.7rem',
                  color: '#7a5a3a',
                  lineHeight: 1.45,
                }}
              >
                <strong style={{ fontWeight: 600 }}>Tip:</strong> Set all three rate codes to avoid $0 invoice errors. Weekend rates typically have higher prices.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: CLIENT_PANEL.horizontalActionGap,
              marginTop: CLIENT_PANEL.horizontalActionMarginTop,
              minWidth: 0,
              width: '100%',
            }}
          >
            <button
              type="submit"
              disabled={saving}
              style={clientPanelPrimaryFlexible({
                opacity: saving ? 0.7 : 1,
                cursor: saving ? 'not-allowed' : 'pointer',
              })}
            >
              <span style={clientPanelBtnLabel}>
                {saving ? 'Saving...' : mode === 'new' ? 'Create Client' : 'Save Changes'}
              </span>
            </button>
            <button type="button" onClick={onClose} style={clientPanelSecondaryCompact()}>
              <span style={clientPanelBtnLabel}>Cancel</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        style={{
          margin: '0 0 0.3rem',
          fontSize: typography.sizes.label,
          fontWeight: typography.weights.bold,
          letterSpacing: typography.letterSpacing.label,
          textTransform: 'uppercase',
          color: colors.muted,
        }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  ...formStyles.input,
};

const selectStyle: React.CSSProperties = {
  ...formStyles.select,
};