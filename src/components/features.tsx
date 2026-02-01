import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BarChart3, BookOpen, Users } from "lucide-react";
import { ReactNode } from "react";

export default function Features() {
  return (
    <section
      className="bg-zinc-50 py-16 md:py-32 dark:bg-transparent"
      id="features"
    >
      <div className="@container mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-4xl font-semibold text-balance lg:text-5xl">
            Everything You Need in One Platform
          </h2>
          <p className="mt-4">
            Powerful tools designed to transform how educational institutions
            operate.
          </p>
        </div>
        <div className="mx-auto mt-8 grid max-w-sm gap-6 *:text-center md:mt-16 @min-4xl:max-w-full @min-4xl:grid-cols-3">
          <Card className="group bg-background">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Users className="size-6" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 font-medium">Dual Panel Experience</h3>
            </CardHeader>

            <CardContent>
              <p className="text-sm">
                Dedicated student and admin interfaces with role-specific
                features. Students access grades and schedules while admins
                control everything from one dashboard.
              </p>
            </CardContent>
          </Card>

          <Card className="group bg-background">
            <CardHeader className="pb-3">
              <CardDecorator>
                <BarChart3 className="size-6" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 font-medium">Live Performance Insights</h3>
            </CardHeader>

            <CardContent>
              <p className="mt-3 text-sm">
                Real-time analytics and visual dashboards that track attendance,
                grades, and institutional metrics. Make data-driven decisions
                instantly.
              </p>
            </CardContent>
          </Card>

          <Card className="group bg-background">
            <CardHeader className="pb-3">
              <CardDecorator>
                <BookOpen className="size-6" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 font-medium">Complete Academic Control</h3>
            </CardHeader>

            <CardContent>
              <p className="mt-3 text-sm">
                Manage attendance, grades, assignments, exams, and communication
                from a single platform. Everything synced and accessible 24/7.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
  <div className="relative mx-auto size-36 mask-radial-from-40% mask-radial-to-60% duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
    <div
      aria-hidden
      className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-50"
    />

    <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-t border-l">
      {children}
    </div>
  </div>
);
