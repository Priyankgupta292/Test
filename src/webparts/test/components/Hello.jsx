import React, { useState } from 'react';
import './style.css'; 
import { SPHttpClient} from '@microsoft/sp-http';

function Hello(props) {
  const { context } = props;
  const [count, setCount] = useState(0);
  const [data, setData] = useState([]);
  const [object,setobject] = useState({title:''})
  const [list,setlist] = useState('')

async function getHello() {
    const response = await fetch('https://dummyjson.com/products');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    console.log(body);
    setData(body.products);
  }

  async function getMyInfo() {
    const token = 'your_token_here';
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    console.log(response);
  }

  function increment() {
    setCount(count + 1);
  }

  function decrement() {
    setCount(count - 1);
  }

   async function GetAllList(context) {
    const restApiUrl = context.pageContext.web.absoluteUrl + '/_api/web/lists?select=Title';
    const listTitles = [];

    try {
        const response = await context.spHttpClient.get(restApiUrl, SPHttpClient.configurations.v1);
        const results = await response.json();

        results.value.forEach((result) => {
          
              listTitles.push({ title:result.Title,id:result.id});
      });
        console.log(listTitles);
        setData(listTitles);
    } catch (error) {
        console.error("An error occurred:", error);
        throw error;
    }
}

async function createListItem(context, listTitle, formData) {
  const restApiUrl = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getByTitle('${listTitle}')/items`;
  if (!listTitle) {
      return "Please Select a list first";
  }

  const body = JSON.stringify({
      "Title": formData.title,
      

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

async function getAllListItems(context, listTitle) {
  const apiUrl = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listTitle}')/items`;

  try {
      const response = await context.spHttpClient.get(apiUrl, SPHttpClient.configurations.v1);
      if (!response.ok) {
          throw new Error(`Error fetching list items: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data.value) 
  } catch (error) {
      console.error('Error fetching list items:', error);
      throw error;
  }
}


  return (



    <div className="hello-container">
      <div className="counter">
        <div className="count">Hello {count}</div>
        <button className="btn" onClick={increment}>
          Increment
        </button>
        <button className="btn" onClick={decrement}>
          Decrement
        </button>
      </div>
      <div className="actions">
        <button className="btn" onClick={getHello}>
          Get data 
        </button>
        <button className="btn" onClick={getMyInfo}>
          Get my data
        </button>
      </div>




      <div className="actions">
        <button className="btn" onClick={()=>{GetAllList(context)}}>
          GetListData 
        </button>
        <button className="btn" onClick={()=>{createListItem(context,'test',{title:'Created By API'})}}>
          create Item
        </button>
      </div>



      <div className='actions'>
        <input type="text" value={list} placeholder='Enter List Name' onChange={(event)=>{
          setlist(event.target.value) 
        }} />
       <input type="text" placeholder='Enter title' value={object.title} onChange={(event)=>{
          setobject({title:event.target.value})
        }}/>

        <button className='btn' onClick={()=>{
          createListItem(context,list,object)
        }}>Add Item</button>

      </div>


        <div className='Action'>
          <button className='btn'
          onClick={()=>{
            getAllListItems(context,'test');
          }}
          >GetListItems</button>
        </div>


      {/* <div className="actions">


        <input type="text" placeholder='Enter List Name'  value={list} onChange={(event)=>{
          setlist(event.target.value)
        }}/>


        <input type="text" placeholder='Enter title' value={object.title} onChange={(event)=>{
          setobject({title:event.target.value})
        }}/>

        <button className='btn' onClick={()=>{createListItem(context,list,object)}}>Create Item</button>
      </div> */}

      




      {data.length > 0 && (
        <div className="data-list">
          {data.map((item) => (
            <p className="data-item" key={item.id}>
              {item.title}
            </p>
          ))}
          <button className="btn" onClick={()=>{setData([])}}>Close</button>
        </div>
      )}
    </div>
  );
}

export default Hello;
