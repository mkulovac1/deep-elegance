// crucial part of the app

import { React, useState } from 'react'

import { AnimatePresence, motion } from 'framer-motion'
import { useSnapshot } from 'valtio'

import config from '../config/config'
import state from '../store'
import { download } from '../assets'
import { downloadCanvasToImage, reader} from '../config/helpers'
import { EditorTabs, FilterTabs, DecalTypes } from '../config/constants'
import { fadeAnimation, slideAnimation } from '../config/motion'

import { AIPicker, FilePicker, ColorPicker, Tab, CustomButton } from '../components'



const Customizer = () => {
  const snap = useSnapshot(state)
  
  const [file, setFile] = useState('')
  const [prompt, setPrompt] = useState('')
  const [generatingImg, setGeneratingImg] = useState(false)

  const [activeEditorTab, setActiveEditorTab] = useState('')
  const [activeFilterTab, setActiveFilterTab] = useState({
    logoShirt: true,
    stylishShirt: false,
  })
    
  const handleActiveEditorTab = (tabName) => { 
    setActiveEditorTab((prevTab) => (prevTab === tabName ? '' : tabName));
  }

  const handleSubmit = async (type) => {
    if(!prompt) return alert("Please enter a prompt");
    
    try {
      // caling API (BE) to generate a new image

      setGeneratingImg(true)
      
      /* const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          prompt: 'funny logo',
          n: 1,                                //define the number of images
          size: '512x512',                     //define the resolution of image
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Authorization': `Bearer ${API_KEY}`,
          },
        }
      );
  
      console.log("Link for image from API:", response.data.data[0].url); 
      
      handleDecals(type, response.data.data[0].url) // update 3D model with new image */

      const response = await fetch('https://deep-elegance-maker.onrender.com/api/v1/dalle', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt, 
        })
      })

      const data = await response.json()

      handleDecals(type, `data:image/png;base64,${data.photo}`) // update 3D model with new image
    }
    catch (err) {
      alert(err)
    } 
    finally {
      setGeneratingImg(false)
      setActiveEditorTab("")
    }
  }

    // show content based on clicked tab:
    const generateTabContent = () => {
      switch (activeEditorTab) { 
        case 'colorpicker':
          return activeEditorTab === 'colorpicker' ? <ColorPicker /> : null;
          // break;
        case 'filepicker':
          return activeEditorTab === 'filepicker' ? (
            <FilePicker file={file} setFile={setFile} readFile={readFile} />
          ) : null;
          // break;
        case 'aipicker':
          return activeEditorTab === 'aipicker' ? (
            <AIPicker
              prompt={prompt}
              setPrompt={setPrompt}
              generatingImg={generatingImg}
              handleSubmit={handleSubmit}
            />
          ) : null;
          // break;
        default:
          return null;
      }
    }

  const handleActiveFilterTab = (tabName) => { 
    switch (tabName) { 
      case 'logoShirt':
        state.isLogoTexture = !activeFilterTab[tabName]
        break;
      case 'stylishShirt':
        state.isFullTexture = !activeFilterTab[tabName]
        break;
      default:
        state.isFullTexture = true;
        state.isLogoTexture = false;
        break;
    }

    // set state to update UI
    setActiveFilterTab((prevState) => {
        return {
          ...prevState,
          [tabName]: !prevState[tabName] // toggle on-off
        }
    })
  }

  const handleDecals = (type, res) => { 
    const decalType = DecalTypes[type]

    state[decalType.stateProperty] = res

    if(!activeFilterTab[decalType.filterTab]) {
      handleActiveFilterTab(decalType.filterTab)
    }
  }

  const readFile = (type) => {
    reader(file).then((res) => {
      handleDecals(type, res)
      setActiveEditorTab("")
    })
  }

  return (
    <AnimatePresence>
      {!snap.intro && (
        <>
            <motion.div
              key="custom"
              className="absolute top-0 left-0 z-10"
              {...slideAnimation('left')}
            >
              <div className="flex items-center min-h-screen">
                <div className="editortabs-container tabs">
                  {EditorTabs.map((tab) => (
                    <Tab 
                      key={tab.name}
                      tab={tab}
                      isActiveTab={activeEditorTab === tab.name}
                      handleClick={() => handleActiveEditorTab(tab.name)}  //tab, isFilterTab, isActiveTab, handleClick
                    />
                  ))}

                  {generateTabContent()}

                </div>
              </div>  
          </motion.div>

          <motion.div
            className='absolute z-10 top-5 right-5'
            {...fadeAnimation}
          >
            <CustomButton 
              type="filled"
              title="Go Back"
              handleClick={() => state.intro = true}
              customStyles="w-fit px-4 py-2.5 font-bold text-sm"
            />
          </motion.div>

          <motion.div
            className='filtertabs-container'
            {...slideAnimation('up')}
          >
            {FilterTabs.map((tab) => (
              <Tab 
                key={tab.name}
                tab={tab}
                isFilterTab
                isActiveTab={activeFilterTab[tab.name]}
                handleClick={() => handleActiveFilterTab(tab.name)}  
              />
            ))}

            <button className='download-btn' onClick={downloadCanvasToImage}>
              <img
                src={download}
                alt='download_image'
                className='w-3/5 h-3/5 object-contain'
              />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Customizer