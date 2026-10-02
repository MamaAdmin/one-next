import { SelectGroup, SelectItem, SelectLabel } from "@/components/ui/select";
import { SLOT_GROUP_LABEL, type VideoSlotDef, type VideoSlotGroup } from "@/features/video/slots";

const ORDER: VideoSlotGroup[] = ["website", "framing", "sprint", "custom"];

/** Grouped select options for all video placements. */
export function SlotSelectItems({ slots }: { slots: VideoSlotDef[] }) {
  return (
    <>
      {ORDER.map((group) => {
        const items = slots.filter((s) => s.group === group);
        if (!items.length) return null;
        return (
          <SelectGroup key={group}>
            <SelectLabel>{SLOT_GROUP_LABEL[group]}</SelectLabel>
            {items.map((s) => (
              <SelectItem key={s.key} value={s.key}>
                {s.label}
              </SelectItem>
            ))}
          </SelectGroup>
        );
      })}
    </>
  );
}
