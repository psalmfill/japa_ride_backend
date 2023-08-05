import { AccountTypes, PrismaClient } from '@prisma/client';
const locationData = require('./jsons/location-seeder.json');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function seedLocation() {
  for (const country of locationData) {
    // check if country exist
    let dbCountry = await prisma.country.findFirst({
      where: {
        name: country.name,
      },
    });
    if (!dbCountry) {
      dbCountry = await prisma.country.create({
        data: {
          name: country.name,
          shortCode: country.code,
          phoneCode: country.phone_code,
        },
      });
    }
    for (const state of country.states) {
      let dbState = await prisma.state.findFirst({
        where: {
          name: state.name,
        },
      });

      if (!dbState) {
        dbState = await prisma.state.create({
          data: {
            name: state.name,
            shortCode: state.state_code,
            country: {
              connect: { id: dbCountry.id },
            },
          },
        });
      }
      //   create the city
      for (const city of state.cities) {
        let dbCity = await prisma.city.findFirst({
          where: {
            name: city.name,
          },
        });
        if (!dbCity) {
          dbCity = await prisma.city.create({
            data: {
              name: city.name,
              shortCode: city.name,
              state: {
                connect: { id: dbState.id },
              },
            },
          });
        }
      }
    }
  }
}

async function main() {
  console.info('Seeding location');
  await seedLocation();
  console.info('Completed Seeding location');
  console.info('Seeding admin');
  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@japparide.com',
    },
    create: {
      email: 'admin@japparide.com',
      name: 'Japparide Admin',
      password: await bcrypt.hash('password', 12),
      referralCode: 'japparide',
      accountType: AccountTypes.admin,
    },
    update: {
      email: 'admin@japparide.com',
      name: 'Japparide Admin',
      password: await bcrypt.hash('password', 12),
      referralCode: 'japparide',
      accountType: AccountTypes.admin,
    },
  });
  console.info('Seeding admin');
  console.info('Completed Seeding currency');
  const currency = await prisma.currency.findFirst({
    where: {
      symbol: 'NGN',
    },
  });
  if (!currency) {
    const currency = await prisma.currency.create({
      data: {
        name: 'Naira',
        symbol: 'NGN',
      },
    });
  }
  console.info('Completed Seeding currency');
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
