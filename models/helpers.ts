import { Fyo, t } from 'fyo';
import { Doc } from 'fyo/model/doc';
import { Action, ColumnConfig, DocStatus, RenderData } from 'fyo/model/types';
import { DateTime } from 'luxon';
import { Money } from 'pesa';
import { safeParseFloat } from 'utils/index';
import { Router } from 'vue-router';
import {
  AccountRootType,
  AccountRootTypeEnum,
} from './baseModels/Account/types';
import {
  Defaults,
  numberSeriesDefaultsMap,
} from './baseModels/Defaults/Defaults';
import { Invoice } from './baseModels/Invoice/Invoice';
import { InvoiceStatus, ModelNameEnum } from './types';

export function getInvoiceActions(fyo: Fyo): Action[] {
  return [
    getMakePaymentAction(fyo),
    getMakeStockTransferAction(fyo),
    getLedgerLinkAction(fyo),
  ];
}

export function getMakeStockTransferAction(fyo: Fyo): Action {
  return {
    label: fyo.t`Make Stock Transfer`,
    condition: (doc: Doc) => doc.isSubmitted && !!doc.stockNotTransferred,
    action: async (doc: Doc) => {
      const transfer = await (doc as Invoice).getStockTransfer();
      if (!transfer) {
        return;
      }

      const { routeTo } = await import('src/utils/ui');
      const path = `/edit/${transfer.schemaName}/${transfer.name}`;
      await routeTo(path);
    },
  };
}

export function getMakePaymentAction(fyo: Fyo): Action {
  return {
    label: fyo.t`Make Payment`,
    condition: (doc: Doc) =>
      doc.isSubmitted && !(doc.outstandingAmount as Money).isZero(),
    action: async (doc: Doc) => {
      const payment = (doc as Invoice).getPayment();
      if (!payment) {
        return;
      }

      payment.once('afterSync', async () => {
        await payment.submit();
      });

      const { openQuickEdit } = await import('src/utils/ui');
      await openQuickEdit({
        doc: payment,
        hideFields: ['party', 'paymentType', 'for'],
      });
    },
  };
}

export function getLedgerLinkAction(
  fyo: Fyo,
  isStock: boolean = false
): Action {
  let label = fyo.t`Ledger Entries`;
  let reportClassName = 'GeneralLedger';

  if (isStock) {
    label = fyo.t`Stock Entries`;
    reportClassName = 'StockLedger';
  }

  return {
    label,
    condition: (doc: Doc) => doc.isSubmitted,
    action: async (doc: Doc, router: Router) => {
      router.push({
        name: 'Report',
        params: {
          reportClassName,
          defaultFilters: JSON.stringify({
            referenceType: doc.schemaName,
            referenceName: doc.name,
          }),
        },
      });
    },
  };
}

export function getTransactionStatusColumn(): ColumnConfig {
  const statusMap = getStatusMap();

  return {
    label: t`Status`,
    fieldname: 'status',
    fieldtype: 'Select',
    render(doc) {
      const status = getDocStatus(doc) as InvoiceStatus;
      const color = statusColor[status];
      const label = statusMap[status];

      return {
        template: `<Badge class="text-xs" color="${color}">${label}</Badge>`,
      };
    },
  };
}

export const statusColor: Record<
  DocStatus | InvoiceStatus,
  string | undefined
> = {
  '': 'gray',
  Draft: 'gray',
  Unpaid: 'orange',
  Paid: 'green',
  Saved: 'gray',
  NotSaved: 'gray',
  Submitted: 'green',
  Cancelled: 'red',
};

export function getStatusMap(): Record<DocStatus | InvoiceStatus, string> {
  return {
    '': '',
    Draft: t`Draft`,
    Unpaid: t`Unpaid`,
    Paid: t`Paid`,
    Saved: t`Saved`,
    NotSaved: t`Not Saved`,
    Submitted: t`Submitted`,
    Cancelled: t`Cancelled`,
  };
}

export function getDocStatus(
  doc?: RenderData | Doc
): DocStatus | InvoiceStatus {
  if (!doc) {
    return '';
  }

  if (doc.notInserted) {
    return 'Draft';
  }

  if (doc.dirty) {
    return 'NotSaved';
  }

  if (!doc.schema?.isSubmittable) {
    return 'Saved';
  }

  return getSubmittableDocStatus(doc);
}

function getSubmittableDocStatus(doc: RenderData | Doc) {
  if (
    [ModelNameEnum.SalesInvoice, ModelNameEnum.PurchaseInvoice].includes(
      doc.schema.name as ModelNameEnum
    )
  ) {
    return getInvoiceStatus(doc);
  }

  if (!!doc.submitted && !doc.cancelled) {
    return 'Submitted';
  }

  if (!!doc.submitted && !!doc.cancelled) {
    return 'Cancelled';
  }

  return 'Saved';
}

export function getInvoiceStatus(doc: RenderData | Doc): InvoiceStatus {
  if (
    doc.submitted &&
    !doc.cancelled &&
    (doc.outstandingAmount as Money).isZero()
  ) {
    return 'Paid';
  }

  if (
    doc.submitted &&
    !doc.cancelled &&
    (doc.outstandingAmount as Money).isPositive()
  ) {
    return 'Unpaid';
  }

  if (doc.cancelled) {
    return 'Cancelled';
  }

  return 'Saved';
}

export async function getExchangeRate({
  fromCurrency,
  toCurrency,
  date,
}: {
  fromCurrency: string;
  toCurrency: string;
  date?: string;
}) {
  if (!fetch) {
    return 1;
  }

  if (!date) {
    date = DateTime.local().toISODate();
  }

  const cacheKey = `currencyExchangeRate:${date}:${fromCurrency}:${toCurrency}`;

  let exchangeRate = 0;
  if (localStorage) {
    exchangeRate = safeParseFloat(
      localStorage.getItem(cacheKey as string) as string
    );
  }

  if (exchangeRate && exchangeRate !== 1) {
    return exchangeRate;
  }

  try {
    const res = await fetch(
      `https://api.vatcomply.com/rates?date=${date}&base=${fromCurrency}&symbols=${toCurrency}`
    );
    const data = await res.json();
    exchangeRate = data.rates[toCurrency];
  } catch (error) {
    console.error(error);
    exchangeRate ??= 1;
  }

  if (localStorage) {
    localStorage.setItem(cacheKey, String(exchangeRate));
  }

  return exchangeRate;
}

export function isCredit(rootType: AccountRootType) {
  switch (rootType) {
    case AccountRootTypeEnum.Asset:
      return false;
    case AccountRootTypeEnum.Liability:
      return true;
    case AccountRootTypeEnum.Equity:
      return true;
    case AccountRootTypeEnum.Expense:
      return false;
    case AccountRootTypeEnum.Income:
      return true;
    default:
      return true;
  }
}

export function getNumberSeries(schemaName: string, fyo: Fyo) {
  const numberSeriesKey = numberSeriesDefaultsMap[schemaName];
  if (!numberSeriesKey) {
    return undefined;
  }

  const defaults = fyo.singles.Defaults as Defaults | undefined;
  const field = fyo.getField(schemaName, 'numberSeries');
  const value = defaults?.[numberSeriesKey] as string | undefined;
  return value ?? (field?.default as string | undefined);
}

export function getDocStatusListColumn(): ColumnConfig {
  return {
    label: t`Status`,
    fieldname: 'status',
    fieldtype: 'Select',
    size: 'small',
    render(doc) {
      const status = getDocStatus(doc);
      const color = statusColor[status] ?? 'gray';
      const label = getStatusMap()[status];

      return {
        template: `<Badge class="text-xs" color="${color}">${label}</Badge>`,
      };
    },
  };
}
