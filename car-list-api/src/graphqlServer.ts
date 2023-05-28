import { ApolloServer, gql } from 'apollo-server-express';
import fs from 'node:fs';

interface CarData {
    brand: string;
    models: string[];
}

const typeDefs = gql`
  type Brand {
    brand: String!
    models: [String]!
  }

  type Query {
    brandWithMostModels: [Brand]
    brandWithLeastModels: [Brand]
    topXBrandsWithModels(x: Int!): [Brand]
    bottomXBrandsWithModels(x: Int!): [Brand]
    modelsByBrand(brandName: String!): [String]
  }
`;

const carList: CarData[] = JSON.parse(fs.readFileSync('./src/car-list.json', { encoding: 'utf-8' }));

const resolvers = {
    Query: {
        brandWithMostModels: () => {
            let maxModelCount = 0;
            let brandsWithMostModels: CarData[] = [];

            for (const brand of carList) {
                if (brand.models.length > maxModelCount) {
                    maxModelCount = brand.models.length;
                    brandsWithMostModels = [brand];
                } else if (brand.models.length === maxModelCount) {
                    brandsWithMostModels.push(brand);
                }
            }
            console.log(brandsWithMostModels);

            return brandsWithMostModels;
        },
        brandWithLeastModels: () => {
            let minModelCount = Infinity;
            let brandsWithLeastModels: CarData[] = [];

            for (const brand of carList) {
                if (brand.models.length < minModelCount) {
                    minModelCount = brand.models.length;
                    brandsWithLeastModels = [brand];
                } else if (brand.models.length === minModelCount) {
                    brandsWithLeastModels.push(brand);
                }
            }

            return brandsWithLeastModels;
        },
        topXBrandsWithModels: (_: any, { x }: { x: number }) => {
            const sortedBrands = carList.sort((a, b) => b.models.length - a.models.length || a.brand.localeCompare(b.brand));
            const topXBrands = sortedBrands.slice(0, x);
            return topXBrands;
        },
        bottomXBrandsWithModels: (_: any, { x }: { x: number }) => {
            const sortedBrands = carList.sort((a, b) => a.models.length - b.models.length || a.brand.localeCompare(b.brand));
            const bottomXBrands = sortedBrands.slice(0, x);
            return bottomXBrands;
        },
        modelsByBrand: (_: any, { brandName }: { brandName: string }) => {
            const matchingBrand = carList.find(brand => brand.brand.toLowerCase() === brandName.toLowerCase());
            return matchingBrand ? matchingBrand.models : [];
        },
    },
};

const server = new ApolloServer({ typeDefs, resolvers });

export default server;
