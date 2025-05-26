import React, { use } from 'react'
import { useParams } from 'react-router-dom'

const States = () => {
    const id = useParams().id;

    return (
        <div>
            {id}
        </div>
    )
}

export default States
