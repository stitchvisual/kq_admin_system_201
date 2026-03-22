import type { NdisPricing } from '@/db/schema/ndis_pricing';
import type { Client } from '@/db/schema/clients';
import {
  PanelHeader,
  PanelContent,
  PrimaryBtn,
  SecondaryBtn,
} from '@/components/panels';

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

const inputClasses =
  'w-full h-9 px-2.5 py-0 rounded-lg border border-primary bg-card text-[var(--font-size-body)] text-foreground outline-none box-border font-body';
const selectClasses =
  'w-full h-9 px-2.5 pr-2 rounded-lg border border-primary bg-card text-[var(--font-size-body)] text-foreground outline-none box-border font-body cursor-pointer';

export function ClientFormPanel({
  mode,
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
      <PanelHeader
        breadcrumb="Clients"
        title={mode === 'new' ? 'Add Client' : 'Edit Client'}
        accentClass="bg-[var(--panel-accent-client)]"
        onClose={onClose}
      />
      <PanelContent>
        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-4">
            <FormField label="Name *">
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                className={inputClasses}
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
                className={inputClasses}
                placeholder="client@example.com"
              />
            </FormField>

            <FormField label="Phone">
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className={inputClasses}
                placeholder="0412 345 678"
              />
            </FormField>

            <FormField label="NDIS Number">
              <input
                type="text"
                id="ndis_number"
                value={formData.ndis_number}
                onChange={e => setFormData({ ...formData, ndis_number: e.target.value })}
                className={inputClasses}
                placeholder="123 456 789"
              />
            </FormField>

            <FormField label="Address">
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className={inputClasses}
                placeholder="123 Main Street"
              />
            </FormField>

            <FormField label="Suburb">
              <input
                type="text"
                id="suburb"
                value={formData.suburb}
                onChange={e => setFormData({ ...formData, suburb: e.target.value })}
                className={inputClasses}
                placeholder="Sydney"
              />
            </FormField>

            <div className="h-px bg-primary my-2" />

            <FormField label="Weekday Rate Code">
              <select
                value={formData.weekday_code}
                onChange={e => setFormData({ ...formData, weekday_code: e.target.value })}
                disabled={loadingPricingCodes}
                className={selectClasses}
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
                className={selectClasses}
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
                className={selectClasses}
              >
                <option value="">Select a pricing code...</option>
                {pricingCodes.map(code => (
                  <option key={code.id} value={code.support_item_code}>
                    {code.support_item_code} — {code.support_item_name} (${code.national_price}/{code.unit})
                  </option>
                ))}
              </select>
            </FormField>

            <div className="p-2.5 rounded-lg bg-[var(--status-pending-bg)] border border-[var(--status-pending-border)] mt-1.5">
              <p className="m-0 text-[var(--font-size-badge)] text-[var(--status-pending-text)] leading-snug">
                <strong className="font-semibold">Tip:</strong> Set all three rate codes to avoid $0 invoice errors. Weekend rates typically have higher prices.
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-6 min-w-0 w-full">
            <PrimaryBtn
              type="submit"
              disabled={saving}
              loading={saving}
              loadingLabel="Saving..."
              className="flex-1 min-w-0"
            >
              <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                {mode === 'new' ? 'Create Client' : 'Save Changes'}
              </span>
            </PrimaryBtn>
            <SecondaryBtn type="button" onClick={onClose}>
              <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">Cancel</span>
            </SecondaryBtn>
          </div>
        </form>
      </PanelContent>
    </>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="m-0 mb-1.5 text-[0.65rem] font-bold tracking-[0.06em] uppercase text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}
