require('dotenv').config()
const { Client } = require('@notionhq/client')

const notion = new Client({ auth: process.env.NOTION_KEY })
const databaseId = process.env.NOTION_DATABASE_ID

async function getTasks() {
	const response = await notion.databases.query({
		database_id: databaseId,
		filter: {
			and: [
				{
					or: [
						{
							property: 'Date TODO',
							date: {
								on_or_before: new Date(),
							},
						},
						{
							property: 'Date TODO',
							date: {
								is_empty: true, // TODO: Get current Date
							},
						},
					],
				},
				{
					property: 'Done?',
					checkbox: {
						equals: false,
					},
				},
			],
		},
		sorts: [
			{
				property: 'Date TODO',
				direction: 'ascending',
			},
			{
				property: 'Priority',
				direction: 'ascending',
			},
		],
	})
	const results = response.results

	const tasks = results.map((page) => {
		var taskName = ''
		if (page.properties.Name.title[0].type === 'text') {
			taskName = page.properties.Name.title[0].text.content
		} else {
			taskName = page.properties.Name.title[0].mention.page.id
		}

		return {
			id: page.id,
			title: taskName,
		}
	})

	return tasks
}

;(async () => {
	const nTasks = await getTasks()
	console.log(nTasks)
})()
