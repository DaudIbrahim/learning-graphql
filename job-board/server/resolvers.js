// Asynchronous calls in Resolvers

// Resolver Chain & Object Associations
// https://www.apollographql.com/docs/apollo-server/data/resolvers/#resolver-chains

// Query Arguments - https://www.apollographql.com/docs/apollo-server/data/resolvers/#handling-arguments

// Variables - Associated with the Query Arguments are variables

// Error Handling - https://www.apollographql.com/docs/apollo-server/data/errors/

// https://www.apollographql.com/docs/apollo-server/data/resolvers/#the-context-argument
// The context argument is useful for passing things that any resolver might need, like authentication scope, database connections, and custom fetch functions.

import { Job } from "./db.js"
import { Company } from "./db.js"

export const resolvers = {
  Query: {
    // For resolvers of top-level fields with no parent (such as fields of Query), this value is obtained from the rootValue function passed to Apollo Server's constructor.
    job: (_root, args) => Job.findById(args.id),

    jobs: () => Job.findAll(),

    company: (_root, args) => Company.findById(args.id)
  },

  Mutation: {
    // `dev` Due Cleanup & refactor
    createJob: (_root, args, context) => {
      const { user } = context
      const { input } = args

      if (!user) {
        throw new Error('Unauthorized')
      }

      return Job.create({ ...input, companyId: context.user.companyId })
    },
    updateJob: async (_root, args, context) => {
      const { user } = context
      const { input } = args
      if (!user) { throw new Error('Unauthorized') }

      const job = await Job.findById(input.id)
      if (job.companyId !== user.companyId) {
        throw new Error('Unauthorized Company Update')
      }

      return Job.update({ ...input, companyId: context.user.companyId })
    },
    deleteJob: async (_root, args, context) => {
      const { user } = context
      const { id } = args
      if (!user) { throw new Error('Unauthorized') }

      const job = await Job.findById(id)
      if (job.companyId !== user.companyId) {
        throw new Error('Unauthorized Company Delete')
      }

      return Job.delete(id)
    }
  },

  // Resolve a field for the Job Type
  Job: {
    // https://www.apollographql.com/docs/apollo-server/data/resolvers/#resolver-arguments
    // Arguments passed to the resolver by GraphQL

    // We can write a resolver function for any field we want,
    // & if we do provide a resolver function then
    // that's what the GraphQL framework will
    // call to get the value for that field.

    // In this case for every Job object it
    // will call our "company" resolver.

    // While for all the other fields for which we don't
    // provide a resolver function, like "id",
    // "title", and "description",
    // the GraphQL framework will simply use the values we
    // provided in the previous step
    // of the resolution chain,
    // in this case the values returned by the
    // "jobs" resolver for the Query type.

    // So basically we need to write a resolver function
    // for a field in a custom type like Job
    // only if we need some special logic to
    // find the right value for that field,
    // like in this case where we need to load the Company
    // object from the database based
    // on the "job.companyId".

    company: (job) => {
      // return an object that conforms to type Company in our schema
      return Company.findById(job.companyId)
    }
  },

  // Resolve field -> jobs. For the Type -> Company.
  Company: {
    jobs: (company) => {
      return Job.findAll((job) => job.companyId === company.id);
    }
  }
}
