
import React, { use } from "react";
import { useParams } from "react-router-dom";
import { BarChart } from '@mui/x-charts/BarChart';


const States = () => {
    const id = useParams().id;

    return (

        <div>
            <BarChart
                xAxis={[
                    {
                        id: 'barCategories',
                        data: ['bar A', 'bar B', 'bar C'],
                    },
                ]}
                series={[
                    {
                        data: [2, 5, 3],
                    },
                ]}
                height={300}
            />;
        </div>
    );
}
export default States;
