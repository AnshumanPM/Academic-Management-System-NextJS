import { Spinner } from "@/components/ui/spinner";

export const FullpageLoader = () => {
  return (
    <div className="bg-background fixed inset-0 z-50 flex items-center justify-center">
      <Spinner />
    </div>
  );
};
