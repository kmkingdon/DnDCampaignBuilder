import {createAsyncThunk, createSlice, PayloadAction, ThunkAction, UnknownAction} from "@reduxjs/toolkit"
import {RootState} from "./store"
import { QueryActionCreatorResult, QueryDefinition, BaseQueryFn, FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from "@reduxjs/toolkit/query";

import { dndApi } from "./api.dnd";
import characterConfig from '../app/components/configs/characterConfig.json';

type sessionInfo = {
    notes: string;
}
interface SessionMap { [key: string]: sessionInfo; }

type abilityInfo = {
  score: number,
  bonus: number
}

type characterInfo = {
  alignment?: string;
  class?: string;
  race?: string;
  traits?: any;
  skills?: string[];
  equipment?: {[key:string]: {value:string, selectId:string}};
  equipmentCategory?: string;
  ability?: {[key:string]: abilityInfo};
  proficiency?: number;
  spells?: string[];
  background?: string;
  actions?: any[]
  level?: number;
}
interface CharacterMap { [key: string]: characterInfo; }

interface ConfigState {
  sessions: SessionMap
  characters: CharacterMap
}

const initialState: ConfigState = {
  sessions: {},
  characters: {}
}

type traitConfig = {
  name: string;
  index: string;
  desc: string[];
  trait_specific?: any;
  parent?: any;
}

type equipmentConfig = {
  equipment_category:{index:string, name:string, url:string};
  armor_category?: string;
  armor_class?: any;
  stealth_disadvantage?: boolean;
  name: string;
  index: string;
  contents?: any[]
  desc?: string[]
  category_range?: string;
  range?: any;
  damage?: any;
}

const getTrait = async (dispatch: (arg0: ThunkAction<QueryActionCreatorResult<QueryDefinition<string, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta>, never, any, "dndApi">>, any, any, UnknownAction>) => { data: any; } | PromiseLike<{ data: any; }>, index: string) => {
  const result = await dispatch(
      dndApi.endpoints.getTrait.initiate(index)
  ) as {data:traitConfig} 
  const selectObj = result.data.trait_specific ? 
    {
      count: result.data.trait_specific.subtrait_options.choose, 
      options: result.data.trait_specific.subtrait_options.from.options.map((i: { item: { index: string; name:string }; }) => {
        return {index: i.item.index, name: i.item.name}
      })
    } : null;
  const traitResult = {
    name: result.data.name,
    index: result.data.index,
    desc: result.data.desc,
    select: selectObj
  }

  return traitResult;
}

const getSubTrait = async (dispatch: (arg0: ThunkAction<QueryActionCreatorResult<QueryDefinition<string, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta>, never, any, "dndApi">>, any, any, UnknownAction>) => { data: any; } | PromiseLike<{ data: any; }>, index: string) => {
  const result = await dispatch(
      dndApi.endpoints.getTrait.initiate(index)
  ) as {data:traitConfig} 
  
  return result;
}

export const getCharacterTraits = createAsyncThunk(
  'config/characterTraits',
  async (payload:any, thunkAPI) => {
    const { id, traits} = payload;
    const { dispatch } = thunkAPI;
    try{
      const mapResult = await Promise.all(traits.map( async(trait: any) => {
        return await getTrait(dispatch, trait.index)
      }))
      return  {key: id, traits: mapResult};
    } catch(e){
      console.log({e})
    }
  }
)

export const getCharacterSubTraits = createAsyncThunk(
  'config/characterSubTraits',
  async (payload:any, thunkAPI) => {
    const { id, subTraits} = payload;
    const { dispatch } = thunkAPI;
    try{
      const mapResult = await Promise.all(Object.entries(subTraits).map( async(entries) => {

        const [ trait, subTrait ] = entries as [string, string];
        return await getSubTrait(dispatch, subTrait)
      }))
      return  {key: id, subTraits: mapResult};
    } catch(e){
      console.log({e})
    }
  }
)


const getEquipmentInfo = async (dispatch: (arg0: ThunkAction<QueryActionCreatorResult<QueryDefinition<string, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta>, never, any, "dndApi">>, any, any, UnknownAction>) => { data: any; } | PromiseLike<{ data: any; }>, index: string) => {
  const result = await dispatch(
      dndApi.endpoints.getEquipment.initiate(index)
  ) as {data:equipmentConfig} 
  let equipmentInfo:any = {};
  equipmentInfo.name= result.data.name;
  equipmentInfo.index = result.data.index;

  if(result.data.equipment_category.index === 'armor'){
    equipmentInfo.type = 'armor';
    equipmentInfo.armor_category = result.data.armor_category;
    equipmentInfo.armor_class = result.data.armor_class;
    equipmentInfo.stealth_disadvantage = result.data.stealth_disadvantage;
  }
  if(result.data.equipment_category.index === 'adventuring-gear'){
    equipmentInfo.type = 'adventuring-gear';
    equipmentInfo.desc = result.data.desc;
    equipmentInfo.contents = result.data.contents;
  }
  if(result.data.equipment_category.index === 'weapon'){
    equipmentInfo.type = 'weapon';
    equipmentInfo.contents = result.data.contents;
    equipmentInfo.category_range = result.data.category_range
    equipmentInfo.range = result.data.range
    equipmentInfo.damage = result.data.damage
  }

  return equipmentInfo;
}

export const getEquipment= createAsyncThunk(
  'config/equipment',
  async (payload:any, thunkAPI) => {
    const { id, equipment} = payload;
    const { dispatch } = thunkAPI;
    try{
      const filteredEquipment = Object.keys(equipment).filter((i:string) => {
        if(i !== 'simple-weapons' && i !== 'simple-melee-weapons' && i !== 'martial-weapons'){
          return i;
        }
      })
      const mapResult = await Promise.all(filteredEquipment.map( async(index: string) => {
        return await getEquipmentInfo(dispatch, index.split('_')[0])
      }))
      return  {key: id, equipment: mapResult};
    } catch(e){
      console.log({e})
    }
  }
)




export const configSlice = createSlice({
    reducers: {
          updateSession: (state, action: PayloadAction<{id:string, notes:string }>) => {
            const { id, notes} = action.payload;
            const sessions = {...state.sessions};
            if (sessions.hasOwnProperty(id)){
              sessions[id].notes = notes;
            } else {
              sessions[id] = {notes}
            }
            state.sessions = sessions;
        },
        updateCharacterParam: (state, action: PayloadAction<{id:string, type: string, value:string | string[] | number | undefined | {[key:string]: {value:string, selectId:string}}}>) => {
            const { id, type, value} = action.payload;
            const characters = {...state.characters};
            if (characters.hasOwnProperty(id)){
              characters[id][type as keyof characterInfo] = value;
            } else {
              characters[id] = {[type]: value}
            }
            state.characters = characters
        },
        createAbilityObject: (state, action: PayloadAction<{id:string, bonus:any}>) => {
          const { id, bonus} = action.payload;
          
          const ability:{[key:string]: abilityInfo} = {prof:{score: 0, bonus: 0}};
          characterConfig.ability.forEach(a => {
            ability[a] = {score: 10, bonus: 0}
          })

          bonus.forEach((b: { ability_score: { index: any; }; bonus: any; }) => {
            let key = b.ability_score.index;
            ability[key] = {score:10 + b.bonus, bonus: b.bonus}
          })
            
          state.characters[id].ability = ability;
      },
      updateAbilityChange: (state, action: PayloadAction<{id:string, type:string, value:number}>) => {
        const { id, type, value} = action.payload;
        const ability = {...state.characters[id].ability};
        ability[type] = {bonus:ability[type]?.bonus, score:value}
        state.characters[id].ability= ability;
      },
    },
    extraReducers: (builder) => {
      builder.addCase(getCharacterTraits.pending , (state) => {
        console.log('pending traits')
      }),
      builder.addCase(getCharacterTraits.fulfilled, (state, action) => {
        if(action.payload){
          const { key, traits} = action.payload;
          const character = {...state.characters[key]};
          character.traits = traits;
          state.characters[key] = character;
        }
      }),
      builder.addCase(getCharacterSubTraits.pending , (state) => {
        console.log('pending subtraits')
      }),
      builder.addCase(getCharacterSubTraits.fulfilled, (state, action) => {
        if(action.payload){
          const { key , subTraits } = action.payload;
          const traits = state.characters[key].traits.map( (t: any) =>  {
            return {...t}
          })
          const updatedTraits = traits.map((t: any) => {
            let trait = {...t};
            subTraits.forEach(s => {
              if(s.data.parent.index === trait.index ){
                trait = {...t, selected: {index: s.data.index, data: s.data.trait_specific }}
              }
            })
            return trait;
          })
          state.characters[key].traits = updatedTraits;
        }
      }),
      builder.addCase(getEquipment.pending , (state) => {
        console.log('pending equipment')
      }),
      builder.addCase(getEquipment.fulfilled, (state, action) => {
        if(action.payload){
          const { key , equipment } = action.payload;
          const equipmentArray = [...equipment]
          const character = {...state.characters[key]};
          character.actions = equipmentArray;
          state.characters[key] = character;
        }
      })
    },
    name: "config",
    initialState
})

// actions
export const {updateSession, updateCharacterParam, createAbilityObject, updateAbilityChange} = configSlice.actions 

// selectors
export const selectSessions = (state: RootState) => state.config.sessions;
export const selectCharacters = (state: RootState) => state.config.characters;

export default configSlice.reducer