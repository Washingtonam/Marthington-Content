const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const currentDir = __dirname;

dotenv.config({ path: path.resolve(currentDir, '.env') });
dotenv.config({ path: path.resolve(currentDir, 'server/.env') });

async function seed() {
  const { default: ContentItem } = await import('./server/src/models/ContentItem.js');

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined. Set it in your environment or .env file.');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const post = await ContentItem.create({
    title: 'Beyond Digital Assets: Why I’m Adding Physical Precious Metals to My 2026 Portfolio',
    vertical: 'Finance',
    contentBody: `### Why I’m Diversifying Into Physical Assets in 2026

As a developer, my world is entirely digital—code, clouds, and data. But when it comes to financial health, I’ve learned that a system without redundancy is a system waiting to fail. This year, I am moving beyond digital-only assets and anchoring my portfolio with physical precious metals.

### The Logic Behind the Hedge
In software, we prioritize stability. In finance, physical silver and gold are the ultimate "cold storage" for wealth. They aren't tethered to a server, a company's stock price, or an interest rate. They are a hedge against the inevitable volatility that comes with market cycles and inflationary pressure.

### Why Silver Gold Bull is My Choice
I don’t settle for outdated platforms. I need transparency, speed, and real-time tracking—exactly what I’d expect from a high-performance application.

**What sets them apart:**
* **Data-Driven Pricing:** No guesswork. You see the premiums clearly before you buy.
* **Institutional-Grade Logistics:** Discreet, fully insured shipping that I can track from vault to doorstep.
* **Maximizing Value:** Their [Deal Zone](https://silvergoldbull.com/deal-zone) is my go-to for finding assets closest to spot price.

### Getting Started
You don’t need a vault to get started. I personally started by accumulating silver due to its dual value as a precious metal and a vital industrial commodity for the tech sector.

**Ready to add some redundancy to your portfolio?**
[Browse their current silver inventory here](https://silvergoldbull.com/silver) or [explore their gold offerings here](https://silvergoldbull.com).

*Disclosure: I prioritize transparency. These are affiliate links that allow me to earn a small commission at no extra cost to you, which helps support this hub.*`,
    affiliateLinks: [
      {
        label: 'Silver Gold Bull',
        url: 'https://www.anrdoezrs.net/click-101813858-13320763'
      }
    ]
  });

  console.log(`Seeded content item with id: ${post._id}`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
