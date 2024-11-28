import { type FC } from "react";
import { WallAreaCalculator } from "~/components/wall-area-calculator";

const HomePage: FC = () => (
  <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-4">
    <WallAreaCalculator />
  </main>
);

export default HomePage;
