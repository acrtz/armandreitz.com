---
name: Basic GraphQL Back-End
slug: basic-graphql-backend
description: how to set up a basic graphql server with a postgres db
npm: 
github: 
website: 
tags: [Javascript, graphql, postgres]
image: /assets/images/posts/2018-07-14-beginner-graphql.png
---

I started playing around with GraphQL a few weeks ago, initially just using [PostGraphile](https://www.graphile.org/postgraphile/) on the backend to take care of setting up the GraphQL schema for me. While PostGraphile is amazing, check it out if you work with postgres, I wanted to understand what was going on behind the scenes and what was being automated.

To see GraphQL in action you don’t actually need a database. You could just have it return static data, but that takes some of the fun out of it. So first we will set up a database. If you are not familiar with postgres and don’t want to go through the process of installing and learning to use it you could use whatever db you want, and just switch out the relevant sections of code.

If you want to jump straight to the code then the repository can be found [here](https://github.com/acrtz/GraphQL_backend).

## Getting the database ready
You can go [here](https://www.postgresql.org/) to learn more about postgres. If you are going to download it, I recommend using [homebrew](https://wiki.postgresql.org/wiki/Homebrew) if you are on a mac.  



The db schema we will use is fairly simple. There will only be two tables, organization and person. A person can be employed by a company in which case the organization’s id is stored as organization_id in that persons row. This is a one to many relationship, with one person only be able to be associated with one organization and an organization being able to be associated with many people.

![database relation](https://armandreitzdotcom-images.s3-us-west-2.amazonaws.com/2018-07-14-basic-graphql-backend-image-1.png)

The tables can be created and populated from the terminal in a few different ways. You could also use a GUI like pgAdmin or DBeaver for creating the database if you feel more comfortable with that.

{: .min-margin }
Option 1. (schema.sql and insert.sql can be found below)

{: .hide-line-numbers}
``` shell_session
createdb example
psql -d example -f <path to schema file/schema.sql>
psql -d example -f <path to insert file/insert.sql>
```

{: .min-margin }
Option 2.

{: .hide-line-numbers}
``` shell_session
createdb example 
psql example
```
and then paste the contents of schema. sql into the command line, make sure to press enter to create the last table, then do the same with the insert.sql

### schema.sql
``` sql
--schema.sql
CREATE TABLE organization (
  id                  SERIAL UNIQUE,
  name                TEXT,
  description         TEXT
);

CREATE TABLE person (
  id                  SERIAL UNIQUE,
  name                TEXT,
  organization_id     INTEGER,
  FOREIGN KEY (organization_id) REFERENCES organization(id)
);
```

### inset.sql
``` sql
--insert.sql
INSERT INTO
  organization (name, description)
VALUES
  ('Nike', 'sports & fitness apparal '),
  ('Intel', 'Tech'),
  ('McDonalds', 'Fastfood');

INSERT INTO
  person (name, organization_id )
VALUES
  ('Pete',(SELECT id FROM organization WHERE name='Nike')),
  ('Donna',(SELECT id FROM organization WHERE name='Nike')),
  ('Ted',(SELECT id FROM organization WHERE name='Intel')),
  ('Stanley',(SELECT id FROM organization WHERE name='McDonalds')),
  ('Steven',(SELECT id FROM organization WHERE name='McDonalds')),
  ('Amanda',(SELECT id FROM organization WHERE name='McDonalds')),
  ('Terra',(SELECT id FROM organization WHERE name='Intel'));
```

To make sure your db is set up correctly you can you can run the following commands

{: .hide-line-numbers}
``` shell_session
psql example
```

{: .min-margin }
then

{: .hide-line-numbers}
``` sql
SELECT * FROM organization;
``` 

You should see three lines of output in the organization table.

## On To The Fun Stuff: GraphQL

We will need two files, server.js and schema.js. From the folder where you want to build the project execute the following commads.

{: .hide-line-numbers}
``` shell_session
npm init 
npm install --save express express-graphql graphql nodemon pg-promise
touch server.js
touch schema.js
```

server.js is pretty straight forward. We are just creating a basic node/express server and telling it to use the graphql middleware. Don't worry about the schema yet since we will look at that next.

``` javascript
//server.js
const express = require('express');
const expressGraphQL = require('express-graphql');
const schema = require('./schema.js')
const app = express();

// create the graphQL server middleware with our schema
const graphQLServer = expressGraphQL({
  schema,
  graphiql: true, //gives access to the graphical interface
});

// tell express to use GraphQL middleware when for the '/graphql' path
app.use('/graphql', graphQLServer);

app.listen(4000, function(){
  console.log("listening on PORT 4000");
});
```

schema.js is where things start to get a bit more complicated. As the name implies this is where we specify the GraphQL schema. To better understand what we are doing when we create the schema it is helpful to understand how GraphQL sees data. The basic idea is, a graph of connected points. All data in this graph is accessed through an individual point which gives access to the graph. This point of entry is the schema object. Within the schema object we will place other objects that can be accessed from the schema. If this seems a bit confusing, not to worry, it will make more sense when you actually see it in practice.

The first thing we will do is create the organization type object representing the organization table from our db. We do this using the types that are provided to us by GraphQL. We will then place this in a root query object, which is then inserted into the GraphQL schema. (explanation follows the code)

``` javascript
//schema.js
const graphql = require('graphql');
const pgp = require('pg-promise')(); //postgres http client
const db = pgp("postgres://localhost:5432/example");

//types provided by GraphQL
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;

const OrganizationType = new GraphQLObjectType({
  name: 'Organization',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString},  
  })
});

const query = new GraphQLObjectType({
  name: 'Query', 
  fields: {
    organization: {
      type: OrganizationType,
      args: { id: { type: GraphQLString } },
      resolve(obj, args) { //parent, arguments, context, info
        return db.one(
          'SELECT * FROM organization WHERE id = $1',[args.id]
        )
      }
    },

  }
})

module.exports = new GraphQLSchema({query})
```

We created an object by using the GraphQLObjectType, each object we create needs to have a name and fields. Fields specifies the data held within the object type we are creating. In the case of the OrganizationType, there are the id, name, and description fields which have a type of GraphQLString. A more complete list of types provided by GraphQL can be found [here](https://graphql.org/graphql-js/type/){: .link }, and there are also other libraries providing additional types such as uuid.

Next we create the root query type which we just call query. This will be placed in our schema and used to hold all of our queries. The fields object in the query object has some fields that weren’t present in the OrganizationType. The args field allows us to pass arguments to our query to specify the data we want. Here the argument is an id of the string type which corresponds to an organization id we would need to query for a specific organization. After the args field there is a function called resolve. This function tells graphQL how to resolve or get the data we are querying. The resolve function is passed 4 arguments the parent, args, context, and info. parent is the object holding the fields object, it allows to access data such as the id of the parent object. args holds the variables that we passed into the aforementioned args field. context and info provide additional resources and information that you can learn more about [here](https://www.prisma.io/blog/graphql-server-basics-the-schema-ac5e2950214e/). Within the resolve function is where we actually make the request to our database. If you decided to not download and use postgres this is were you could query some other database or return hard coded data.

(Note: the postgres client pg-promise has features that I am not going into but that you should know about if you plan on making use of the library in less contrived settings. For instance db.one, db.many, db.oneOrNone, db.manyOrNone can be specified and will result in an error if the number of rows returned doesn’t match the specified values. Alternatively db.any can be used but does offer the same type of error detection.)

The final thing we need to do before we can start seeing GraphQL in action is to create the schema object, insert the query into it, and then export it for use in our server.js file.

At this point we should be able to go to the command line and run the command ‘nodemon server.js’ from the folder containing server.js. If you see the output message listening on PORT 4000 then everything is running fine and you can head over to your browser and enter the address, localhost:4000/graphql , which should open up the graphiQL graphical interface which looks like this

![graphical display](https://armandreitzdotcom-images.s3-us-west-2.amazonaws.com/graphiql-display.jpeg)

if you click on Docs in the top right of the screen you will be able to see the queries that are now available to us. There should be a root queries followed by query: Query. Clicking on Query will then show you the organization type we just created. We can perform our first query by placing the following code in the code editor (the portion of the screen currently containing the # comments) and hitting the play button. If you type the query rather than copy pasting it you will realise the GraphiQL has autocomplete which is pretty helpful.

{: .hide-line-numbers}
``` javascript
query {
  organization(id: "1") {
    id
    name
    description
  }
}
```

You should end up getting a response that looks like this:

![graphiql response](https://armandreitzdotcom-images.s3-us-west-2.amazonaws.com/graphiql-response.jpeg)

Notice that the Docs section tells us what arguments we need to give the organization object type (id: String) in this case. I happen to know that the ids for our three organizations are “1”, “2”, and “3”, since they were entered into the database with the SERIAL type. Try and run the command with the other two id strings. Looking back at the Docs segment of the screen. If you click on Organization, the one after the ‘:’, you will see the data that is available to you within the organization type. We can choose any of the data we want. Go ahead and remove id, name, or description from the code editor. Notice how it is then gone from the returned data. This is the true power of GraphQL you can specify from the front side exactly the data you want. No more over or under-fetching.

Lets get back to server.js and add our personType object so that we can get some more complicated queries going.

In the code you will notice that there is now an employees field that has been added to the OrganizationType.This field is slightly more complicated than the previous three. The reason is that it represents another type that will be created by us, and since it is not just a simple data type we have to tell GraphQL how to deal with it using a resolve function. Just like with the other fields we also have to specify its type, which in this case we expect an organization’s employees to be returned from out database in an array. To communicate this to GraphQL we use the provided GraphQLList type (array), wrapping the PersonType which we will create next.

The PersonType is very similar to the OrganizationType except that it doesn’t have a description field and that instead of an employees field it has organization, which is not a list type. Something that I haven’t mentioned up until this point, but you might have noticed by now is that the fields entities in both the PersonType and the OrganizationType is not just a plain object as I have been referring to them. They are actually arrow functions returning and object. The reason for this has to do with javascript scope. The two two type objects have a cyclical dependency. This means that they both refer to each other. If we did use that arrow function our code would run into issues because the PersonType referred to in the OrganizationType type wont be declared until after the OrganizationType has already been declared. We solve this by wrapping the fields object in an arrow function so the reference is made at a later point when the cyclical dependancy will no longer be an issue.

We also had to add the person type into the query object so that it can actually be accessed.

``` javascript
// schema.js
const graphql = require('graphql');
const pgp = require('pg-promise')(); //postgres http client
const db = pgp("postgres://localhost:5432/example");

//types provided by GraphQL
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;

const OrganizationType = new GraphQLObjectType({
  name: 'Organization',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString},
     employees: {
      type: new GraphQLList(PersonType),
      resolve(parent) { //parent, arguments, context, info
        return db.many(
          'SELECT * FROM person WHERE organization_id = $1', 
          [parent.id]
        )
      }
    }  
  })
})

const PersonType = new GraphQLObjectType({
  name: 'Person',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    organization: {
      type: OrganizationType,
      resolve(parent) { //parent, args, context, info
        return db.one(
          'SELECT * FROM organization WHERE id = $1',       
          [parent.organization_id]
        )
      }
    }
  })
})

const query = new GraphQLObjectType({
  name: 'Query', 
  fields: {
    organization: {
      type: OrganizationType,
      args: { id: { type: GraphQLString } },
      resolve(obj, args) { //parent, arguments, context, info
        return db.one(
          'SELECT * FROM organization WHERE id = $1',[args.id]
        )
      }
    },  
    person: {
      type: PersonType,
      args: { id: { type: GraphQLString } },
      resolve(parent, args) { //parent, arguments, context, info
        return db.one(
          'SELECT * FROM person WHERE id = $1', [args.id]
        )
      }
    },
  }
})

module.exports = new GraphQLSchema({ query })
```

After the proceeding changes are saved you should be able to go to your browser, refresh the GraphiQL interface, and then have access to the person type. Look at the Docs section to see which queries are available. If you still aren’t sure then try these:

``` javascript
query {
  organization(id: "1") {
    name
    employees {
      id
      name
    }
  }
}
```

{: .min-margin } 
or

``` javascript
query {
  person(id:"1"){
    name
    organization {
      id
      name
    }
  }
}
```

Once again you can change the id string to “2”, “3”… to see data for the other employees. You could also go even deeper by looking at the employees in the organization that a person belongs to.

Next we will take a look at how mutations are done. The root mutation type is pretty much the same as the query type. The only new thing is that we are using the GraphQLNonNull type in the args.name field. This just tells graphQL that we must provide a name argument when we want to create a person in our database. The resolve function works the same as in the query type the only difference is that the interaction with the database leads to the creation or updating of data rather than just fetching it. Since we are still specifying a return type (PersonType), GraphQL will expect the interaction with the database to return data matching the PersonType. We also have to make sure that we insert the mutation object into the schema object.

``` javascript
//schema.js
const graphql = require('graphql');
const pgp = require('pg-promise')(); //postgres http client
const db = pgp("postgres://localhost:5432/example");

//types provided by GraphQL
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;

//our other code ...

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addPerson: {
      type: PersonType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString)}, 
        organization_id: { type: GraphQLString }
      },
      resolve(parent, args) { //parent, arguments, context, info
        return db.one(
          `INSERT INTO person(name, organization_id) 
          VALUES ($1,$2) RETURNING *`,
          [args.name, args.organization_id]
        )
      }
    }
  }
})
 
module.exports = new GraphQLSchema({query, mutation})
```

After the mutation has been added and saved you can go back to the GraphiQL, refresh the browser and take a look at the Docs. You should now notice that instead of just have the root query we also have mutation, clicking on this will should you the mutations that are currently available. You can try the following mutation using your own name.

``` javascript
mutation {
  addPerson(name:"YourName", organization_id: "1"){
    id
    name
    organization {
      name
    }
  }
}
```

Well that covers the basics.

If you look at the [complete code](https://github.com/acrtz/GraphQL_backend) you will see that there are some additional queries added, allOrganizations, and allPeople. Since each query needs to return a given type we can’t use the organization query to return a list of organizations instead we would need to create a second query like the allOrganizations one if we wanted access to all the organizations stored in our db.

If you are looking to practice what you have learned then here are some things you could try to do.  
-Add another table to the db and create its type object and query so you can access it through GraphiQL.  
-Create a delete mutation for the PersonType  
-Create a mutation for the OrganizationType  

Please let me know if you any questions, suggestions, or feedback.