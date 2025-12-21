import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { ChartContainer } from "./ui/chart";
import { CategoryReports } from "@/lib/api-schemas";
import { colord } from "colord";

interface CategorySpendingBarChartProps {
    data: CategoryReports
}

export function CategorySpendingBarChart({data}: CategorySpendingBarChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <ChartContainer config={{}}>
                <BarChart layout='vertical' data={data} margin={{ left: 20, right: 50, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="categoryName" type="category" width={80} />
                    <Bar dataKey="delta" stackId="a" isAnimationActive={true} label={{ position: 'right' }}>
                        {data.map((c,i) => {
                            return <Cell key={`delta-${i}`} fill={c.categoryColor} />;
                        })}
                    </Bar>
                    <Bar dataKey="expensesSum" stackId="a" isAnimationActive={true}>
                        {data.map((c,i) => <Cell key={`category-${i}`} fill="var(--muted-bar)"/>)}
                    </Bar>

                </BarChart>
            </ChartContainer>
        </Card>
    )
}