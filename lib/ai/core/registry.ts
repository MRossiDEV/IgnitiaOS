import { ReportMemory } from "./types";

export type PipelineStage =
		| "collector"
		| "analyst"
		| "action";

export interface PipelineTask {

		id: string;

		name: string;

		description: string;

		stage: PipelineStage;

		enabled?: boolean;

		priority?: number;

		execute(
				memory: ReportMemory
		): Promise<unknown>;

}

class AIRegistry {

		private collectors =
				new Map<string, PipelineTask>();

		private analysts =
				new Map<string, PipelineTask>();

		private actions =
				new Map<string, PipelineTask>();



		register(
				task: PipelineTask
		) {

				switch(task.stage){

						case "collector":

								this.collectors.set(
										task.id,
										task
								);

								break;

						case "analyst":

								this.analysts.set(
										task.id,
										task
								);

								break;

						case "action":

								this.actions.set(
										task.id,
										task
								);

								break;

				}

		}



		unregister(
				id:string
		){

				this.collectors.delete(id);

				this.analysts.delete(id);

				this.actions.delete(id);

		}



		getCollectors(){

				return [...this.collectors.values()]
						.filter(x=>x.enabled!==false)
						.sort(
								(a,b)=>
								(a.priority??0)-
								(b.priority??0)
						);

		}



		getAnalysts(){
			return [...this.analysts.values()]
				.filter(x=>x.enabled!==false)
				.sort(
						(a,b)=>
						(a.priority??0)-
						(b.priority??0)
				);
		}



		getActions(){

				return [...this.actions.values()]
						.filter(x=>x.enabled!==false)
						.sort(
								(a,b)=>
								(a.priority??0)-
								(b.priority??0)
						);

		}



		getTask(
				id:string
		){

				return (

						this.collectors.get(id)

						||

						this.analysts.get(id)

						||

						this.actions.get(id)

				);

		}



		list(){

				return{

						collectors:
								this.getCollectors(),

						analysts:
								this.getAnalysts(),

						actions:
								this.getActions(),

				};

		}

}

export const registry =
		new AIRegistry();