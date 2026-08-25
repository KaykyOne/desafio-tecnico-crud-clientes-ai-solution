"use client";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";

function CollapsibleRoot({ ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({ ...props }: CollapsiblePrimitive.Trigger.Props) {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />;
}

function CollapsibleContent({ ...props }: CollapsiblePrimitive.Panel.Props) {
  return <CollapsiblePrimitive.Panel data-slot="collapsible-content" {...props} />;
}

export { CollapsibleRoot, CollapsibleTrigger, CollapsibleContent };

const Collapsible = {
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent,
};

export default Collapsible;
