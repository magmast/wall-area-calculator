"use client";

import { type ReactNode, useState, forwardRef, type ForwardedRef } from "react";
import { Input } from "./ui/input";
import { Button, MotionButton } from "./ui/button";
import { Plus, Minus } from "lucide-react";
import {
  Card,
  CardTitle,
  CardContent,
  MotionCardFooter,
  MotionCardHeader,
} from "./ui/card";
import { MotionSeparator } from "./ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import validator from "validator";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";

const MotionCard = motion.create(Card);

const MotionCardContent = motion.create(CardContent);

const floatInputSchema = (params: validator.IsFloatOptions = {}) =>
  z
    .string()
    .refine(
      (value) => validator.isFloat(value, params),
      "Must be a valid number.",
    )
    .transform(Number);

const schema = z
  .object({
    wallHeight: floatInputSchema({ gt: 0 }),
    wallLengths: z
      .array(z.object({ length: floatInputSchema({ gt: 0 }) }))
      .min(1),
    openings: z.array(
      z.object({
        width: floatInputSchema({ gt: 0 }),
        height: floatInputSchema({ gt: 0 }),
      }),
    ),
  })
  .superRefine((value, ctx) => {
    value.openings.forEach((opening, index) => {
      if (opening.height > value.wallHeight) {
        ctx.addIssue({
          code: "custom",
          path: [...ctx.path, "openings", index, "height"],
          message: "Opening height cannot be greater than height of the wall.",
        });
      }
    });

    // TODO: Check if total width of openings is lesser than total length of
    //  walls. It's not done yet, because I don't want to bother with displaying
    //  an error that's not related to a single field, but a number of fields at
    //  once.
  });

export const WallAreaCalculator = () => {
  const form = useForm<
    z.input<typeof schema>,
    unknown,
    z.output<typeof schema>
  >({
    resolver: zodResolver(schema),
    defaultValues: {
      wallHeight: "2.7",
      wallLengths: [{ length: "" }],
      openings: [{ width: "", height: "" }],
    },
  });

  const wallLengths = useFieldArray({
    control: form.control,
    name: "wallLengths",
  });

  const handleAddWall = () => wallLengths.append({ length: "" });

  const handleRemoveWall = (index: number) => wallLengths.remove(index);

  const openings = useFieldArray({
    control: form.control,
    name: "openings",
  });

  const handleAddOpening = () => openings.append({ width: "", height: "" });

  const handleRemoveOpening = (index: number) => openings.remove(index);

  const [totalArea, setTotalArea] = useState<number | null>(null);

  const handleSubmit = ({
    wallHeight,
    wallLengths,
    openings,
  }: z.output<typeof schema>) => {
    const totalWallLength = wallLengths.reduce(
      (sum, wall) => sum + wall.length,
      0,
    );
    const wallArea = totalWallLength * wallHeight;

    const totalOpeningsArea = openings.reduce(
      (sum, opening) => sum + opening.width * opening.height,
      0,
    );
    const netWallArea = wallArea - totalOpeningsArea;

    setTotalArea(netWallArea);
  };

  const handleReset = () => {
    setTotalArea(null);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <MotionCard className="mx-auto w-full max-w-2xl p-6" layout>
          <MotionCardHeader layout>
            <CardTitle className="text-2xl">Wall Area Calculator</CardTitle>
          </MotionCardHeader>

          <MotionCardContent layout>
            <FormField
              control={form.control}
              name="wallHeight"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel>Wall Height (meters):</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min="0" step="0.01" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <MotionSeparator className="my-4" layout />

            <ArrayField
              label="Wall Lengths (meters)"
              addLabel="Add Wall"
              onAdd={handleAddWall}
            >
              <AnimatePresence>
                {wallLengths.fields.map(({ id }, index) => (
                  <MotionFieldRow
                    key={id}
                    onRemove={() => handleRemoveWall(index)}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    exit={{ scaleY: 0 }}
                    transition={{ duration: 0.1 }}
                    layout
                  >
                    <FormField
                      control={form.control}
                      name={`wallLengths.${index}.length`}
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder={`Wall ${index + 1} Length`}
                              min="0"
                              step="0.01"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </MotionFieldRow>
                ))}
              </AnimatePresence>
            </ArrayField>

            <MotionSeparator className="my-4" layout />

            <ArrayField
              label="Doors and Windows"
              addLabel="Add Door/Window"
              onAdd={handleAddOpening}
            >
              {openings.fields.map(({ id }, index) => (
                <MotionFieldRow
                  key={id}
                  onRemove={() => handleRemoveOpening(index)}
                  initil={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  exit={{ scaleY: 0 }}
                  layout
                >
                  <FormField
                    control={form.control}
                    name={`openings.${index}.width`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder={`Opening ${index + 1} Width (m)`}
                            min="0"
                            step="0.01"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`openings.${index}.height`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder={`Opening ${index + 1} Height (m)`}
                            min="0"
                            step="0.01"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </MotionFieldRow>
              ))}
            </ArrayField>
          </MotionCardContent>

          <MotionCardFooter className="flex flex-col items-center" layout>
            <MotionButton type="submit" className="mb-2 w-full" layout>
              Calculate Total Wall Area
            </MotionButton>

            <AnimatePresence>
              {form.formState.isDirty && (
                <MotionButton
                  type="reset"
                  onClick={handleReset}
                  className="w-full"
                  variant="destructive"
                  layout
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  exit={{ scaleY: 0 }}
                >
                  Reset
                </MotionButton>
              )}
            </AnimatePresence>

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
          </MotionCardFooter>
        </MotionCard>
      </form>
    </Form>
  );
};

const ArrayField = ({
  label,
  children,
  addLabel,
  onAdd,
}: {
  label: string;
  children?: ReactNode;
} & (
  | { addLabel: string; onAdd: () => void }
  | { addLabel?: undefined; onAdd?: undefined }
)) => (
  <motion.div className="mb-6" layout>
    <motion.div layout className="flex items-center justify-between">
      <h3 className="text-xl font-semibold">{label}</h3>

      {addLabel != null && onAdd != null && (
        <Button type="button" variant="ghost" size="sm" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" /> {addLabel}
        </Button>
      )}
    </motion.div>

    {children}
  </motion.div>
);

const FieldRow = forwardRef(
  (
    { children, onRemove }: { children: ReactNode; onRemove?: () => void },
    ref?: ForwardedRef<HTMLDivElement>,
  ) => (
    <div ref={ref} className="mt-4 flex items-center space-x-2">
      {children}

      {onRemove != null && (
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <Minus className="h-4 w-4" />
        </Button>
      )}
    </div>
  ),
);
FieldRow.displayName = "FieldRow";

const MotionFieldRow = motion.create(FieldRow);
