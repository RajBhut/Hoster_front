import React, { use } from 'react'

const States = () => {
    const id = useParams().id;

    return (
        <div>
            {id}
        </div>
    )
}

export default States
