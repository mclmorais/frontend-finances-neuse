import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell, LabelProps } from "recharts";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { ChartContainer } from "./ui/chart";
import { CategoryReports } from "@/lib/api-schemas";
import { ICONS } from "@/lib/icons";
import { useMemo } from "react";

interface CategorySpendingBarChartProps {
    data: (CategoryReports[number] & { delta: number })[]
}

interface CustomYAxisTickProps {
    x?: number;
    y?: number;
    payload?: { value: string };
    dataMap: Map<string, CategoryReports[number]>;
}

function CustomYAxisTick({ x = 0, y = 0, payload, dataMap }: CustomYAxisTickProps) {
    const category = payload ? dataMap.get(payload.value) : undefined;
    const IconComponent = ICONS.find(i => i.name === category?.categoryIcon)?.component;

    return (
        <g transform={`translate(${x},${y})`}>
            <foreignObject x={-110} y={-12} width={110} height={24}>
                <div className="flex items-center gap-1.5 font-sans text-xs h-full">
                    <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: category?.categoryColor }}
                    >
                        {IconComponent && <IconComponent className="w-3 h-3 text-white" />}
                    </div>
                    <span className="truncate text-foreground">{payload?.value}</span>
                </div>
            </foreignObject>
        </g>
    );
}

export function CategorySpendingBarChart({data}: CategorySpendingBarChartProps) {
    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => b.budget - a.budget);
    }, [data]);

    const dataMap = useMemo(() => {
        return new Map(sortedData.map(item => [item.categoryName, item]));
    }, [sortedData]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <ChartContainer config={{}}>
                <BarChart layout='vertical' data={sortedData} margin={{ left: 30, right: 50, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis 
                        dataKey="categoryName" 
                        type="category" 
                        width={115}
                        tick={(props) => <CustomYAxisTick {...props} dataMap={dataMap} />}
                    />
                    <Bar dataKey="delta" stackId="a" isAnimationActive={true}>
                        {sortedData.map((c,i) => {
                            return <Cell key={`delta-${i}`} fill={c.categoryColor} />;
                        })}
                    </Bar>
                    <Bar 
                        dataKey="expensesSum" 
                        stackId="a" 
                        isAnimationActive={true}
                        label={(props: LabelProps) => {
                            const { x = 0, y = 0, width = 0, height = 0, index = 0 } = props;
                            const item = sortedData[index];
                            return (
                                <text
                                    x={(x as number) + (width as number) + 5}
                                    y={(y as number) + (height as number) / 2}
                                    dominantBaseline="middle"
                                    className="font-sans text-xs fill-foreground"
                                >
                                    {`$${Math.ceil(item.delta)}`}
                                </text>
                            );
                        }}
                    >
                        {sortedData.map((c,i) => <Cell key={`category-${i}`} fill="var(--muted-bar)"/>)}
                    </Bar>

                </BarChart>
            </ChartContainer>
        </Card>
    )
}