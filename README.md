# elections-results-embed

## What is this?

This is a generic elections results embed for the dallasnews homepage that can be cloned and repuprosed from election to election to show an individual race's results. However, since it's unlikely to have mutiple elections on-going at the same time on the homepage, one could use this file repeatedly. 

## How to use

#### Initial setup
**You can skip this step if continuing to use this repository. For fresh installs, proceed**

- In the `meta.json` file, change the `name` to one that reflects the current election, and the `year` to the current year.
- In the `scripts.js` file, change the `baseURL` variable to reflect the bucket the current election's results will live in on S3.
- You should also populate the `aws.json` file with your aws credentials. 

#### Specifying races and elections.

To use this properly, there are four variables you'll need to change in the `scripts.js` file.

- `baseURL` = the directory in S3 where the election metadata and results are published
- `displayedParties` = for primary elections, set an array with the corresponding parties in the same order as their races in `displayedRaces`. For non-primary elections, you can comment out this line or delete the contents of the array.
- `displayedRaces` = an array of race UUIDs you want to show. Race UUIDs can be found under on the `edit races` page of the election at our [Elections Admin page](elections-admin.dallasnews.com).
- `electionName` = the name of the election. This is used in the refer line to full election coverage at the bottom of the embed
- `electionURL` = the url of the elections results and liveblog interactive. Also used in the refer line.

#### Publishing in arc

Supply the embed url (https://interactives.dallasnews.com/embeds/<<meta.json['year']/<<meta.json['name']>>) to the audience team. 

# Base interactive embed info

This is an embeddable graphic built using the [`dmninteractives` Yeoman generator](https://github.com/DallasMorningNews/generator-dmninteractives). It's designed to be embedded using [Pym.js](http://blog.apps.npr.org/pym.js/) as a responsive `iframe`.

## Requirements

- Node - `brew install node`
- Gulp - `npm install -g gulp-cli`

## Local development

#### Installation

1. `npm install` to install development tooling
2. `gulp` to open a local development server

#### What's inside

- `src/index.html` - Graphic HTML markup; there's no Nunjucks, etc. so this is just straight HTML
- `src/embed.html` - A page to test your embed
- `src/js/*.js` - Graphic scripts, written in ES2015 (it'll be transpiled with Babel)
- `src/sass/*.scss` - Graphic styles in SCSS
- `dist/*` - All of the above, transpiled

_Important caveat:_ Video, audio and ZIP files are ignored by `git` regardless of where they're saved. You'll need to manually alter the [`.gitignore`](.gitignore) file to have them committed to Github.

#### Publishing

`gulp publish` will upload your [`dist/`](dist/) folder to the `embeds/2020/<<name>>/` folder on our interactives S3 bucket, (where `<<name>>` is found in the `meta.json` file).


## Copyright

&copy;2020 The Dallas Morning News
