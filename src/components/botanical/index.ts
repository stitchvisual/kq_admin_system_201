/**
 * Botanical Design System
 * =======================
 *
 * This is the canonical component library for the application.
 * All new components should be added here and use the design tokens
 * from @/styles/botanical.
 *
 * @example
 * // Import components from the botanical system
 * import { Button, Card, Badge, DataTable } from '@/components/botanical';
 */

// ============================================================================
// CORE COMPONENTS
// ============================================================================

// Layout & Containers
export { Card } from './Card';
export {
  DataTable,
  DataTableHeader,
  DataTableHeaderLabel,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  DataTableHeaderGrid,
  DataTableRowGrid,
} from './DataTable';

// Form Controls
export { Button } from './Button';
export { Input } from './Input';
export { DateInput, DateRangeInput } from './DateInput';

// Display Components
export { Badge } from './Badge';
export { 
  Skeleton, 
  SkeletonText, 
  SkeletonAvatar, 
  SkeletonButton, 
  SkeletonCard, 
  SkeletonRow, 
  SkeletonCell,
  SkeletonGrid,
  SkeletonAppointmentCard,
  SkeletonInvoiceItem,
  SkeletonClientRow,
} from './Skeleton';

// Empty States
export { 
  EmptyState, 
  EmptyClients, 
  EmptyAppointments, 
  NoAppointmentResults, 
  EmptyInvoices, 
  EmptyInvoiceGenerate, 
  EmptyDashboard, 
  NotFound,
} from './EmptyState';

// ============================================================================
// RE-EXPORTED DESIGN TOKENS (for convenience)
// ============================================================================

export {
  colors,
  shadows,
  typography,
  radii,
  spacing,
  animations,
  buttonStyles,
  formStyles,
  cardStyles,
  skeleton,
  appointmentStatus,
  invoiceStatus,
  getClientPalette,
  getAppointmentStatusStyle,
  getInvoiceStatusStyle,
  CLIENT_PALETTES,
  GROUP_PALETTE,
} from '@/styles/botanical';