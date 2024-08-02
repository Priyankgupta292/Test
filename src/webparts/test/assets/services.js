import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPHttpClient } from '@microsoft/sp-http';

export class SPOperations {
    
    async GetListItemFromID(context, listTitle, ID) {
        try {
            const apiUrl = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listTitle}')/items(${ID})`;
            const response = await context.spHttpClient.get(apiUrl, SPHttpClient.configurations.v1);
            console.log(response.ok);

            if (!response.ok) {
                return {
                    "Title": '',
                    "Location": '',
                    "Description": '',
                    "Highlights": '',
                    "Rating": '',
                    "Activities": '',
                    "Ack": `No Item Exists with ID: ${ID}`,
                    "success": false,
                };
            }
            const data = await response.json();

            const listItemObject = {
                "Title": data.Title,
                "Location": data.Location,
                "Description": data.Description,
                "Highlights": data.Highlights,
                "Rating": data.Rating,
                "Activities": data.Activities,
                "Ack": "List Item fetched Successfully",
                "success": true,
            };

            return listItemObject;
        } catch (error) {
            console.error('Error fetching list item:', error);
            return { "Ack": `${error.message}` };
        }
    }

    async GetAllList(context) {
        const restApiUrl = context.pageContext.web.absoluteUrl + '/_api/web/lists?select=Title';
        const listTitles = [];

        try {
            const response = await context.spHttpClient.get(restApiUrl, SPHttpClient.configurations.v1);
            const results = await response.json();

            results.value.forEach((result) => {
                if (result.Title === "Destination List")
                    listTitles.push({ key: result.Title, text: result.Title });
            });

            return listTitles;
        } catch (error) {
            console.error("An error occurred:", error);
            throw error;
        }
    }

    async CreateListItem(context, listTitle, formData) {
        const restApiUrl = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getByTitle('${listTitle}')/items`;
        if (!listTitle) {
            return "Please Select a list first";
        }

        const body = JSON.stringify({
            "Title": formData.destinationName,
            "Location": formData.location,
            "Description": formData.description,
            "Highlights": formData.highlights,
            "Rating": formData.rating,
            "Activities": formData.activities,
        });
        console.log(body);

        const options = {
            headers: {
                Accept: "application/json;odata=nometadata",
                "Content-Type": "application/json;odata=nometadata",
                "odata-version": ""
            },
            body: body
        };

        try {
            const response = await context.spHttpClient.post(restApiUrl, SPHttpClient.configurations.v1, options);
            if (response.ok) {
                let x = await response.json();
                console.log(x.Id);
                return `List item created with id: ${x.Id}`;
            } else {
                const errorResponse = await response.json();
                throw new Error(`Error creating list item: ${errorResponse.error.message.value}`);
            }
        } catch (error) {
            console.error("An error occurred:", error);
            throw error;
        }
    }

    DeleteListItem(context, listTitle, ID) {
        const restApiUrl = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getByTitle('${listTitle}')/items(${ID})`;
        return new Promise(async (resolve, reject) => {
            context.spHttpClient.post(restApiUrl, SPHttpClient.configurations.v1, {
                headers: {
                    Accept: "application/json;odata=nometadata",
                    "Content-Type": "application/json;odata=nometadata",
                    "odata-version": "",
                    "IF-MATCH": "*",
                    "X-HTTP-METHOD": "DELETE"
                }
            }).then((Response) => {
                resolve(`Item with Id ${ID} deleted successfully`);
            }, (error) => {
                reject("error occurred");
            })
        });
    }

    getLatestItemId(context, listTitle) {
        const restApiUrl = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getByTitle('${listTitle}')/items/?$orderby=Id desc&$top=1&$select=id`;

        return new Promise((resolve, reject) => {
            context.spHttpClient.get(restApiUrl, SPHttpClient.configurations.v1, {
                headers: {
                    Accept: "application/json;odata=nometadata",
                    "Content-Type": "application/json;odata=nometadata",
                    "odata-version": ""
                }
            }).then((response) => {
                if (response.ok) {
                    response.json().then((result) => {
                        if (result && result.value && result.value.length > 0) {
                            resolve(result.value[0].Id);
                        } else {
                            reject("No items found in the list.");
                        }
                    }, (error) => {
                        reject("Error parsing response JSON.");
                    });
                } else {
                    reject(`Error getting latest item ID: ${response.statusText}`);
                }
            }).catch((error) => {
                reject(`Error getting latest item ID: ${error}`);
            });
        });
    }

    async UpdateListItem(context, listTitle, formData, ID) {
        const body = JSON.stringify({
            Title: formData.destinationName,
            Location: formData.location,
            Description: formData.description,
            Highlights: formData.highlights,
            Rating: formData.rating,
            Activities: formData.activities,
        });
        const restApiUrl = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getByTitle('${listTitle}')/items`;
        return new Promise(async (resolve, reject) => {
            context.spHttpClient.post(`${restApiUrl}(${ID})`, SPHttpClient.configurations.v1, {
                headers: {
                    Accept: "application/json;odata=nometadata",
                    "Content-Type": "application/json;odata=nometadata",
                    "odata-version": "",
                    "IF-MATCH": "*",
                    "X-HTTP-METHOD": "MERGE"
                }, body: body,
            }).then((Response) => {
                resolve(`Item with Id ${ID} updated successfully`);
            }, (error) => {
                reject("error occurred");
            })
        });
    }

    // Uncomment and adjust this method if you need it
    // async GetListColumns(context, listTitle) {
    //     try {
    //       const sp = spfi(context);
    //       const list = sp.web.lists.getByTitle(listTitle);
    //       const items = await list.items.top(1).select('*').select('*');
    //       const columnNames = Object.keys(items[0]);
    //       return columnNames;
    //     } catch (error) {
    //       console.error('Error retrieving list columns:', error);
    //       return [];
    //     }
    // }
}
