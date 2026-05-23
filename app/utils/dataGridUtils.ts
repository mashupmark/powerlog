import { DateTime } from "luxon";
import { DataGridFeatures, OnyxSystemButton, type DataGridEntry } from "sit-onyx";

export const dateTypeRenderer = <TEntry extends DataGridEntry = DataGridEntry>(locale: MaybeRef<string>) =>
  DataGridFeatures.createTypeRenderer<any, TEntry>({
    cell: {
      component: ({ modelValue }) => {
        if (!modelValue || typeof modelValue !== "string") return undefined;
        return DateTime.fromISO(modelValue).toFormat("ccc dd.MM.yyyy", {
          locale: unref(locale),
        });
      },
    },
  });

export const timeTypeRenderer = <TEntry extends DataGridEntry = DataGridEntry>() =>
  DataGridFeatures.createTypeRenderer<any, TEntry>({
    cell: {
      component: ({ modelValue }) => {
        if (!modelValue || typeof modelValue !== "string") return undefined;
        return DateTime.fromISO(modelValue).toFormat("HH:mm");
      },
    },
  });

export const buttonRenderer = <TEntry extends DataGridEntry = DataGridEntry>(options: {
  label: string;
  icon: string;
  onClick: (row: TEntry) => void | Promise<void>;
}) =>
  DataGridFeatures.createTypeRenderer<any, TEntry>({
    cell: {
      component: ({ row }) =>
        h(OnyxSystemButton, {
          icon: options.icon,
          label: options.label,
          onClick: () => options.onClick(row),
        }),
    },
  });
