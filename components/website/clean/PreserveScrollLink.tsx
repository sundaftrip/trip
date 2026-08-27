import Link from "next/link";
import {
  forwardRef,
  type ComponentProps,
} from "react";

type PreserveScrollLinkProps = ComponentProps<typeof Link>;

const PreserveScrollLink = forwardRef<HTMLAnchorElement, PreserveScrollLinkProps>(
  function PreserveScrollLink({ scroll, ...props }, ref) {
    return <Link {...props} ref={ref} scroll={scroll ?? false} />;
  },
);

export default PreserveScrollLink;
