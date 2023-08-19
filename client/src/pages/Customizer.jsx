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
    
  const handleSubmit = async (type) => {
    if(!prompt) return alert("Please enter a prompt");
    
    try {
      // caling API (BE) to generate a new image

      setGeneratingImg(true)
      
      const res = await fetch('http://localhost:8080/api/v1/dalle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          prompt,
        })
      })

      const data = await res.json()

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
          return <ColorPicker />
          // break;
        case 'filepicker':
          return <FilePicker 
            file={file}
            setFile={setFile}
            readFile={readFile}
          />
          // break;
        case 'aipicker':
          return <AIPicker 
            prompt={prompt}
            setPrompt={setPrompt}
            generatingImg={generatingImg}
            handleSubmit={handleSubmit}
          />
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
                      handleClick={() => setActiveEditorTab(tab.name)}  
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