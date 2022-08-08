import { request, gql } from 'graphql-request'
import { getAccessToken } from '../auth';

const GRAPHQL_URL = 'http://localhost:9000/graphql'

export async function createJob(input) {
    const query = gql`
        mutation CreateJob($input: CreateJobInput!) {
            # https://graphql.org/learn/queries/#aliases
            job: createJob(input: $input) {
                id
            }
        }
    `;

    // ES6 Object Literal Property Value Shorthand in JavaScript
    // https://attacomsian.com/blog/javascript-object-property-shorthand
    const variables = { input }

    // Headers
    const headers = { 'Authorization': `Bearer ${getAccessToken()}` }

    const { job } = await request(GRAPHQL_URL, query, variables, headers)
    return job
}

export async function getCompany(companyId) {
    const query = gql`
        query($companyId: ID!) {
            company(id: $companyId) {
                id,
                name,
                description,
                jobs {
                    id,
                    title
                    company {
                        name
                    }
                }
            }
        }
    `;

    const variables = { companyId }
    const { company } = await request(GRAPHQL_URL, query, variables)
    return company
}


export async function getJob(jobId) {
    const query = gql`
        query JobQuery($jobId: ID!) {
            job(id: $jobId) {
                id,
                title
                company {
                    id
                    name
                }
                description
            }
        }
    `;

    const variables = { jobId }
    const { job } = await request(GRAPHQL_URL, query, variables)
    return job
}

export async function getJobs() {
    const query = gql`
        query {
            jobs {
                id,
                title,
                company {
                    name
                }
            }
        }
    `;

    const { jobs } = await request(GRAPHQL_URL, query)
    return jobs
}