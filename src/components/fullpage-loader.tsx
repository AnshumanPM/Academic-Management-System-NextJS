import { Spinner } from "@/components/ui/spinner";

export const FullpageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <Spinner />
    </div>
  );
};
