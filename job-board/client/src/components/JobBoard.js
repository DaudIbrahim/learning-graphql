import { useState, useEffect } from 'react'
import JobList from './JobList';
import { getJobs } from '../graphql/queries'

function JobBoard() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(false)

  useEffect(() => {
    getJobs().then((jobs) => setJobs(jobs))
      .catch((error) => setError(true))
  }, [])

  if (error) {
    return (
      <p>Error. Something went wrong.</p>
    )
  }

  return (
    <div>
      <h1 className="title">
        Job Board
      </h1>
      <JobList jobs={jobs} />
    </div>
  );
}

export default JobBoard;
