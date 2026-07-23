// ======================================================
// IgnitiaOS AI Memory Manager
// lib/ai/core/memory.ts
// ======================================================

import { ReportMemory } from "./types";


const memoryStore =
  new Map<string, ReportMemory>();

export class AIMemory {

  /**
   * Create isolated memory for one report
   */
  static create(
    reportId:string
  ):ReportMemory {
    const memory:ReportMemory = {
      reportId,
      createdAt: new Date(),
      business:{
        name:"",
        website:"",
        industry:"",
        businessType:"",
        city:"",
        country:"",
        goal:"",
        challenge:"",
      },
      collected: {
        business: null,
        website: {          
          url:"",
          html:"",
          text:"",
          title:"",
          description:"",
          language:"",
          headings:{
            h1:[],
            h2:[],
            h3:[],
            h4:[],
            h5:[],
            h6:[],
          },
          links:[],
          images:[],
          forms:[],
          technologies:[],
          scripts:[],
          stylesheets:[],
          schema:[],
          metadata:{},
        },
        google:{},
        social:{},
        competitors:{
          competitors:[]
        },
      },
      analysis: {
          seo: undefined,
          content: undefined,
          ux: undefined,
          conversion: undefined,
          branding: undefined,
          copywriting: undefined,
          social: undefined,
          google: undefined,
          reputation: undefined,
          competitors: undefined,
          performance: undefined,
          accessibility: undefined,
          trust: undefined,
          analytics: undefined,
          crm: undefined,
          sales: undefined,
          email: undefined,
          strategy: undefined,
      },
      metadata:{},
    };

    memoryStore.set(
      reportId,
      memory
    );

    return memory;

  }





  /**
   * Get report memory
   */
  static get(
    reportId:string
  ):ReportMemory {


    const memory =
      memoryStore.get(
        reportId
      );


    if(!memory){

      throw new Error(

        `AI Memory not found: ${reportId}`

      );

    }


    return memory;


  }





  /**
   * Check memory exists
   */
  static exists(
    reportId:string
  ){


    return memoryStore.has(
      reportId
    );


  }





  /**
   * Update a section
   */
  static update<K extends keyof ReportMemory>(

    reportId:string,

    key:K,

    value:ReportMemory[K]

  ){


    const memory =
      this.get(reportId);


    memory[key]=value;


  }





  /**
   * Merge object sections
   */
  static merge<

    K extends keyof ReportMemory

  >(

    reportId:string,

    key:K,

    value:Partial<ReportMemory[K]>

  ){


    const memory =
      this.get(reportId);



    memory[key] = {


      ...(memory[key] as any),


      ...value,


    };



  }





  /**
   * Export copy
   */
  static export(
    reportId:string
  ):ReportMemory {


    return structuredClone(

      this.get(reportId)

    );


  }





  /**
   * Delete after workflow ends
   */
  static destroy(
    reportId:string
  ){


    memoryStore.delete(
      reportId
    );


  }





  /**
   * Debug
   */
  static listActive(){


    return [

      ...memoryStore.keys()

    ];


  }


}