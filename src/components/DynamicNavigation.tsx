import { useNavigation, NavigationItem } from "@/hooks/useNavigation";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

interface DynamicNavigationProps {
  menuName: string;
  className?: string;
  itemClassName?: string;
}

const renderIcon = (iconName: string | null) => {
  if (!iconName) return null;
  const Icon = (Icons as any)[iconName];
  return Icon ? <Icon className="h-4 w-4" /> : null;
};

const NavigationItemComponent = ({
  item,
  itemClassName,
}: {
  item: NavigationItem;
  itemClassName?: string;
}) => {
  const content = (
    <>
      {renderIcon(item.icon)}
      <span>{item.label}</span>
    </>
  );

  if (!item.url) {
    return (
      <div className={cn("flex items-center gap-2", itemClassName)}>
        {content}
      </div>
    );
  }

  const isExternal = item.url.startsWith("http");

  if (isExternal) {
    return (
      <a
        href={item.url}
        target={item.target}
        rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
        className={cn("flex items-center gap-2", itemClassName)}
      >
        {content}
      </a>
    );
  }

  return (
    <Link to={item.url} className={cn("flex items-center gap-2", itemClassName)}>
      {content}
    </Link>
  );
};

export const DynamicNavigation = ({
  menuName,
  className,
  itemClassName,
}: DynamicNavigationProps) => {
  const { items, loading } = useNavigation(menuName);

  if (loading) {
    return <div className={className}>Lädt...</div>;
  }

  return (
    <nav className={className}>
      {items
        .filter((item) => item.is_active)
        .map((item) => (
          <div key={item.id}>
            <NavigationItemComponent item={item} itemClassName={itemClassName} />
            {item.children && item.children.length > 0 && (
              <div className="ml-4 mt-2 space-y-2">
                {item.children
                  .filter((child) => child.is_active)
                  .map((child) => (
                    <NavigationItemComponent
                      key={child.id}
                      item={child}
                      itemClassName={itemClassName}
                    />
                  ))}
              </div>
            )}
          </div>
        ))}
    </nav>
  );
};
