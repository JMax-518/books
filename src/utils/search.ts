import { t } from 'fyo';
import { ModelNameEnum } from 'models/types';
import reports from 'reports/view';
import { fyo } from 'src/initFyo';
import { routeTo } from './ui';

enum SearchGroupEnum {
  'List' = 'List',
  'Report' = 'Report',
  'Create' = 'Create',
  'Setup' = 'Setup',
}

type SearchGroup = keyof typeof SearchGroupEnum;
interface SearchItem {
  label: string;
  group: SearchGroup;
  route?: string;
  action?: () => void;
}

async function openQuickEditDoc(schemaName: string) {
  await routeTo(`/list/${schemaName}`);
  const doc = await fyo.doc.getNewDoc(schemaName);
  const { openQuickEdit } = await import('src/utils/ui');

  await openQuickEdit({
    schemaName,
    name: doc.name as string,
  });
}

async function openFormEditDoc(schemaName: string) {
  const doc = fyo.doc.getNewDoc(schemaName);
  const name = doc.name;

  routeTo(`/edit/${schemaName}/${name}`);
}

function getCreateList(): SearchItem[] {
  return [
    {
      label: t`Create Item`,
      group: 'Create',
      action() {
        openQuickEditDoc(ModelNameEnum.Item);
      },
    },
    {
      label: t`Create Party`,
      group: 'Create',
      action() {
        openQuickEditDoc(ModelNameEnum.Party);
      },
    },
    {
      label: t`Create Payment`,
      group: 'Create',
      action() {
        openQuickEditDoc(ModelNameEnum.Payment);
      },
    },
    {
      label: t`Create Sales Invoice`,
      group: 'Create',
      action() {
        openFormEditDoc(ModelNameEnum.SalesInvoice);
      },
    },
    {
      label: t`Create Purchase Invoice`,
      group: 'Create',
      action() {
        openFormEditDoc(ModelNameEnum.PurchaseInvoice);
      },
    },
    {
      label: t`Create Journal Entry`,
      group: 'Create',
      action() {
        openFormEditDoc(ModelNameEnum.JournalEntry);
      },
    },
  ];
}

function getReportList(): SearchItem[] {
  return Object.values(reports).map((report) => {
    return {
      label: report.title,
      route: `/report/${report.method}`,
      group: 'Report',
    };
  });
}

function getListViewList(): SearchItem[] {
  return [
    ModelNameEnum.Account,
    ModelNameEnum.Party,
    ModelNameEnum.Item,
    ModelNameEnum.Payment,
    ModelNameEnum.JournalEntry,
    ModelNameEnum.PurchaseInvoice,
    ModelNameEnum.SalesInvoice,
    ModelNameEnum.Tax,
  ]
    .map((s) => fyo.schemaMap[s])
    .filter((s) => s && !s.isChild && !s.isSingle)
    .map((s) => ({
      label: s!.label,
      route: `/list/${s!.name}`,
      group: 'List',
    }));
}

function getSetupList(): SearchItem[] {
  return [
    {
      label: t`Chart of Accounts`,
      route: '/chartOfAccounts',
      group: 'Setup',
    },
    {
      label: t`Data Import`,
      route: '/data_import',
      group: 'Setup',
    },
    {
      label: t`Settings`,
      route: '/settings',
      group: 'Setup',
    },
  ];
}

export function getSearchList() {
  const group: Record<SearchGroup, string> = {
    Create: t`Create`,
    List: t`List`,
    Report: t`Report`,
    Setup: t`Setup`,
  };

  return [getListViewList(), getCreateList(), getReportList(), getSetupList()]
    .flat()
    .map((si) => ({
      ...si,
      group: group[si.group],
    }));
}
