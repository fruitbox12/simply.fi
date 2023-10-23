import PropTypes from 'prop-types'
import { Handle, Position } from 'reactflow'
import { useSelector } from 'react-redux'
// material-ui
import { styled, useTheme } from '@mui/material/styles'
import { Avatar, Box, Typography } from '@mui/material'
import React, { useState } from 'react';
import nodesApi from 'api/nodes'
import { useMediaQuery } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard'

// icons
import { IconCheck, IconExclamationMark } from '@tabler/icons'

// const
import { baseURL } from 'store/constant'
import AddNodes from './AddNodes'

const CardWrapper = styled(MainCard)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',  // Opacity glass effect
  backdropFilter: 'blur(10px)',
  color: theme.darkTextPrimary,
  border: 'solid 1px rgba(255, 255, 255, 0.2)', // Add a slight border
  width: '100px',
  height: '100px',
  padding: '10px',
  boxShadow: 'inset 4px 4px 10px 0 rgba(0, 0, 0, 0.25), inset -4px -4px 10px 0 rgba(255, 255, 255, 0.3), 0 0 15px rgba(0, 128, 255, 0.5)', // Inner shadow and blue glow
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2)', // Make hover slightly more opaque
    borderColor: 'rgba(0, 128, 255, 0.5)', // Blue glow on hover
    boxShadow: 'inset 4px 4px 10px 0 rgba(0, 0, 0, 0.25), inset -4px -4px 10px 0 rgba(255, 255, 255, 0.3), 0 0 30px rgba(0, 128, 255, 0.7)', // Stronger blue glow on hover
  },
  '&:hover .add-nodes': {
    opacity: 1,
  },
}));

const handlerPosition = [[['50%']], [['30%'], ['70%']]]


  
const AddNodesStyled = styled(AddNodes)(({ theme }) => ({
    position: 'relative',
    top: '0',
    right: '5px', // Changed from -20rem to 5px
    opacity: 0,
    transition: 'opacity 0.3s ease',
    zIndex: 1,
    marginRight: '5px', // Optional, adds extra spacing if needed
}));

  const CanvasNode = ({ data }) => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)'); // Add this line

    const [selectedNode, setSelectedNode] = useState(null);
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    return (
        <>
<CardWrapper
  onMouseOver={() => setSelectedNode(data)}
  content={false}
  sx={{
    borderColor: data.selected ? theme.palette.primary.main : theme.palette.text.secondary
  }}
  border={false}
>   

                {data && data.outputResponses && data.outputResponses.submit && (
                    <Avatar
                        variant='rounded'
                        sx={{
                            ...theme.typography.smallAvatar,
                            borderRadius: '50%',
                            background: theme.palette.success.dark,
                            color: 'white',
                            ml: 2,
                            position: 'absolute',
                            top: -10,
                            right: -10
                        }}
                    >
                        <IconCheck />
                    </Avatar>
                )}

                {data && data.outputResponses && data.outputResponses.needRetest && (
                    <Avatar
                        variant='rounded'
                        sx={{
                            ...theme.typography.smallAvatar,
                            borderRadius: '50%',
                            background: theme.palette.warning.dark,
                            color: 'white',
                            ml: 2,
                            position: 'absolute',
                            top: -10,
                            right: -10
                        }}
                    >
                        <IconExclamationMark />
                    </Avatar>
                )}

                <Box>
                    {data.inputAnchors.map((inputAnchor, index) => (
                        <Handle
                            type='target'
                            position={customization.isVertical ? Position.Top : Position.Left}
                            key={inputAnchor.id}
                            id={inputAnchor.id}
                            style={{
                                height: 15,
                                width: 15,
                                top: customization.isVertical ? -7.5 : null,
                                backgroundColor: data.selected ? theme.palette.primary.main : theme.palette.text.secondary,
                                left: customization.isVertical ? handlerPosition[data.inputAnchors.length - 1][index] : null,
                                bottom: !customization.isVertical ? handlerPosition[data.inputAnchors.length - 1][index] : null
                            }}
                        />
                    ))}
<div style={{ 
    display: 'flex', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    height: '100%',
    width: '100%'
}}>
<Box style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100%', 
    paddingTop: '10px',  // or use theme.spacing() if using Material-UI
    paddingBottom: '10px'  // or use theme.spacing() if using Material-UI
}}>                            <div
                                style={{
                                    ...theme.typography.commonAvatar,
                                    ...theme.typography.largeAvatar,
                                    borderRadius: '50%',
                                    cursor: 'grab'
                                }}
                            >
                                <img
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', filter: customization.isDarkMode ? 'invert(1)' : 'invert(0)'  // Corrected line

                                }}
                                src={`${baseURL}/api/v1/node-icon/${data.name}`}
                                alt='Notification'
                                /> 
                            </div>
                            <Typography
                                sx={{
                                    fontSize: '.5rem',
                                    fontWeight: 400,
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                }}
                            >
                                {data.label}
                            </Typography>
                        </Box>
                
                    </div>
                    {data.outputAnchors.map((outputAnchor, index) => (
                        <Handle
                            type='source'
                            position={customization.isVertical ? Position.Bottom : Position.Right}
                            key={outputAnchor.id}
                            id={outputAnchor.id}
                            style={{
                                height: 15,
                                width: 15,
                                bottom: customization.isVertical ? -7.5 : null,
                                backgroundColor: data.selected ? theme.palette.primary.main : theme.palette.text.secondary,
                                left: customization.isVertical ? handlerPosition[data.outputAnchors.length - 1][index] : null,
                                top: !customization.isHorizontal ? handlerPosition[data.outputAnchors.length - 1][index] : null
                            }}
                        />
                    ))}
                </Box>
               
            </CardWrapper>   
        </>
    )
}

CanvasNode.propTypes = {
    data: PropTypes.object
}

export default CanvasNode