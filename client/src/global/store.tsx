import { Accessor, Setter, createContext, useContext, createSignal } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";

interface ContextProps {
  isMobile: Accessor<boolean>,
  setIsMobile: Setter<boolean>,
  prevRoute: Accessor<string>,
  setPrevRoute: Setter<string>,
  uuid: Accessor<string>,
  setUuid: Setter<string>,
  loadLocalStorage: Function,
  clearStore: Function,
  setStore: Function,
  apiCall: Function,
  navigate: Function,
}

const GlobalContext = createContext<ContextProps>();

export function GlobalContextProvider(props) {
  const server_url = "http://192.168.2.97:3000";

  const navigateFunc = useNavigate();
  const location = useLocation();
  
  const [prevRoute, setPrevRoute]   = createSignal('');
  const [isMobile, setIsMobile]     = createSignal(false);
  const [uuid, setUuid]             = createSignal('');

  const navigate = (params) => {
    setPrevRoute(location.pathname);
    navigateFunc(params);
  }

  const loadLocalStorage = () => {
    console.log("Loading local storage");
    // const u: LoggedUserData = JSON.parse(localStorage.getItem('user_data'));
    // const d: DealershipData = JSON.parse(localStorage.getItem('dealership_data'));
    // setStore(u, d);
  }

  const setStore = (u, d) => {
    console.log("Setting store")
    // localStorage.setItem('user_data', JSON.stringify(u));
    // localStorage.setItem('dealership_data', JSON.stringify(d));
  }

  const clearStore = () => {
    console.log("Clearing store");
    // const u: LoggedUserData = {
    //   token: '', uuid: '', auth: false, username: '', full_name: '', u_role: '', email: '', is_first_login: false
    // } 
    // const d: DealershipData = {
    //   dealership_name: '', latitude: 0.0, longitude: 0.0, status_keys: [], user_list: []
    // }
    // setStore(u, d);
  }

  const apiCall = (
    endpoint: string, 
    method: string = 'GET',
    params: object = {},
    body: object = {}
  ) => {
    let url = `${server_url}${endpoint}`;
    if (endpoint.length > 0 && endpoint[0] != "/") {
      url = `${server_url}/${endpoint}`;
    }
    
    // const u: LoggedUserData = JSON.parse(localStorage.getItem('user_data'));
  
    // const uuid  = (u && 'uuid' in u)  ? u.uuid  : "null";
    // const token = (u && 'token' in u) ? u.token : "null";
  
    const d = {
      method: method,
      headers: {
        'content-type': 'application/json;charset=UTF-8',
        // 'Authorization': token,
        // 'uuid': uuid
      },
    }
  
    if (method == 'POST') d['body'] = JSON.stringify(body);
    if (method == 'GET' && Object.keys(params).length > 0 ) {
      let param_strs = [];
      for(let key in params) {
        param_strs.push(`${key}=${params[key]}`);
      }
      url += `?${param_strs.join("&")}`
    }
    
    console.log(`[${method}]: ${url} (${JSON.stringify(params)}) (${JSON.stringify(body)})`);
  
    return fetch(url, d)
      .then(response => {
        if (!response.ok) {
          // Add new token to localstorage?
          if (response.status == 401) { // Unauthorized
            // clearStore();
            // navigate('/login');
            return response.json();
          }
        }
        return response.json();
      });
  };
  
	return (
	<GlobalContext.Provider value={{ 
      isMobile, setIsMobile,
      prevRoute, setPrevRoute,
      uuid, setUuid,
      clearStore, setStore, loadLocalStorage,
      apiCall, 
      navigate
    }}>
			{props.children}
		</GlobalContext.Provider>
	);
}

export const useGlobalContext = () => useContext(GlobalContext)!;