import Link from "next/link";
import {
  forwardRef,
  type ComponentProps,
} from "react";
import { shouldScrollLinkToFragment } from "@/lib/navigation-scroll";

type PreserveScrollLinkProps = ComponentProps<typeof Link>;

const PreserveScrollLink = forwardRef<HTMLAnchorElement, PreserveScrollLinkProps>(
  function PreserveScrollLink({ href, scroll, ...props }, ref) {
    return (
      <Link
        {...props}
        href={href}
        ref={ref}
        scroll={scroll ?? shouldScrollLinkToFragment(href)}
      />
    );
  },
);

export default PreserveScrollLink;
