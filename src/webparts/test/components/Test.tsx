import * as React from 'react';
import styles from './Test.module.scss';
import type { ITestProps } from './ITestProps';
import Hello from './Hello';



export default class Test extends React.Component<ITestProps, {}> {
  public render(): React.ReactElement<ITestProps> {
       
  
    return (  
 
      <section className={`${styles.test} `}>
        
        <h1 className={`${styles.Heading}`}>Hello Priyank</h1> 
        <Hello user='Priyank' context={this.props.context}/>
         
       
      </section>
    );
  } 
}
