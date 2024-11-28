"use client";

import { useState, type ChangeEvent, type FC } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Plus, Minus } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Separator } from "./ui/separator";

interface WallLength {
  length: number | "";
}

interface Opening {
  width: number | "";
  height: number | "";
}

export const WallAreaCalculator: FC = () => {
  const [wallHeight, setWallHeight] = useState<number>(2.7);
  const [wallLengths, setWallLengths] = useState<WallLength[]>([
    { length: "" },
  ]);
  const [openings, setOpenings] = useState<Opening[]>([
    { width: "", height: "" },
  ]);
  const [totalArea, setTotalArea] = useState<number | null>(null);

  const isDirty =
    wallHeight !== 2.7 ||
    wallLengths.length !== 1 ||
    wallLengths[0]?.length !== "" ||
    openings.length !== 1 ||
    openings[0]?.width !== "" ||
    openings[0]?.height !== "";

  const handleWallHeightChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setWallHeight(value === "" ? 0 : parseFloat(value));
  };

  const handleWallLengthChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const values = [...wallLengths];
    values[index]!.length =
      event.target.value === "" ? "" : parseFloat(event.target.value);
    setWallLengths(values);
  };

  const handleAddWall = () => {
    setWallLengths([...wallLengths, { length: "" }]);
  };

  const handleRemoveWall = (index: number) => {
    const values = [...wallLengths];
    values.splice(index, 1);
    setWallLengths(values);
  };

  const handleOpeningChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const values = [...openings];
    const { name, value } = event.target;
    values[index]![name as keyof Opening] =
      value === "" ? "" : parseFloat(value);
    setOpenings(values);
  };

  const handleAddOpening = () => {
    setOpenings([...openings, { width: "", height: "" }]);
  };

  const handleRemoveOpening = (index: number) => {
    const values = [...openings];
    values.splice(index, 1);
    setOpenings(values);
  };

  const calculateArea = () => {
    const totalWallLength = wallLengths.reduce(
      (sum, wall) => sum + (wall.length || 0),
      0,
    );

    const wallArea = totalWallLength * wallHeight;

    const totalOpeningsArea = openings.reduce(
      (sum, opening) => sum + (opening.width || 0) * (opening.height || 0),
      0,
    );

    const netWallArea = wallArea - totalOpeningsArea;

    setTotalArea(netWallArea);
  };

  const clear = () => {
    setWallHeight(2.7);
    setWallLengths([{ length: "" }]);
    setOpenings([{ width: "", height: "" }]);
    setTotalArea(null);
  };

  return (
    <Card className="mx-auto max-w-2xl p-6">
      <CardHeader>
        <CardTitle className="text-2xl">Wall Area Calculator</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          <Label htmlFor="wallHeight" className="mb-2 block">
            Wall Height (meters):
          </Label>
          <Input
            id="wallHeight"
            type="number"
            value={wallHeight}
            onChange={handleWallHeightChange}
            min="0"
            step="0.01"
            className="w-full"
          />
        </div>

        <Separator className="my-4" />

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Wall Lengths (meters)</h3>
            <Button variant="ghost" size="sm" onClick={handleAddWall}>
              <Plus className="mr-2 h-4 w-4" /> Add Wall
            </Button>
          </div>
          {wallLengths.map((wall, index) => (
            <div key={index} className="mt-4 flex items-center">
              <Input
                type="number"
                placeholder={`Wall ${index + 1} Length`}
                value={wall.length}
                onChange={(e) => handleWallLengthChange(index, e)}
                min="0"
                step="0.01"
                className="w-full"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveWall(index)}
                className="ml-2"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Doors and Windows</h3>
            <Button variant="ghost" size="sm" onClick={handleAddOpening}>
              <Plus className="mr-2 h-4 w-4" /> Add Door/Window
            </Button>
          </div>
          {openings.map((opening, index) => (
            <div key={index} className="mt-4 flex items-center space-x-2">
              <Input
                type="number"
                name="width"
                placeholder={`Opening ${index + 1} Width (m)`}
                value={opening.width}
                onChange={(e) => handleOpeningChange(index, e)}
                min="0"
                step="0.01"
                className="w-full"
              />
              <Input
                type="number"
                name="height"
                placeholder={`Opening ${index + 1} Height (m)`}
                value={opening.height}
                onChange={(e) => handleOpeningChange(index, e)}
                min="0"
                step="0.01"
                className="w-full"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveOpening(index)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-center">
        <Button onClick={calculateArea} className="mb-2 w-full">
          Calculate Total Wall Area
        </Button>

        {isDirty && (
          <Button onClick={clear} className="w-full" variant="destructive">
            Clear
          </Button>
        )}

        {totalArea !== null && (
          <div className="mt-6 text-center">
            <h3 className="text-xl font-semibold">
              Total Wall Area (excluding doors and windows):
            </h3>
            <p className="text-2xl font-bold">
              {totalArea.toFixed(2)} square meters
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
