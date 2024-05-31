import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';
import Cronr from 'cronr';

// material-ui
import { Box, Button, Chip, CircularProgress, Stack, Typography, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// third party
import ReactJson from 'react-json-view';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import AttachmentDialog from 'ui-component/dialog/AttachmentDialog';
import HTMLDialog from 'ui-component/dialog/HTMLDialog';
import ExpandDataDialog from 'ui-component/dialog/ExpandDataDialog';
import { StyledButton } from 'ui-component/StyledButton';

// API
import nodesApi from 'api/nodes';
import webhookApi from 'api/webhooks';

// Hooks
import useApi from 'hooks/useApi';

// icons
import { IconExclamationMark, IconCopy, IconArrowUpRightCircle, IconX, IconArrowsMaximize } from '@tabler/icons';

// const
import { baseURL } from 'store/constant';

// utils
import { copyToClipboard } from 'utils/genericHelper';

// ==============================|| OUTPUT RESPONSES ||============================== //

const OutputResponses = ({ nodeId, nodeParamsType, nodeFlowData, nodes, edges, workflow, onSubmit }) => {
    const theme = useTheme();
    const customization = useSelector((state) => state.customization);

    const [outputResponse, setOutputResponse] = useState([]);
    const [errorResponse, setErrorResponse] = useState(null);
    const [nodeName, setNodeName] = useState(null);
    const [nodeType, setNodeType] = useState(null);
    const [nodeLabel, setNodeLabel] = useState(null);
    const [isTestNodeBtnDisabled, disableTestNodeBtn] = useState(true);
    const [testNodeLoading, setTestNodeLoading] = useState(false);
    const [showHTMLDialog, setShowHTMLDialog] = useState(false);
    const [HTMLDialogProps, setHTMLDialogProps] = useState({});
    const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
    const [attachmentDialogProps, setAttachmentDialogProps] = useState({});
    const [showExpandDialog, setShowExpandDialog] = useState(false);
    const [expandDialogProps, setExpandDialogProps] = useState({});
    const [tunnelURL, setTunnelURL] = useState('');

    const testNodeApi = useApi(nodesApi.testNode);
    const getTunnelURLApi = useApi(webhookApi.getTunnelURL);
    const testWebhookApi = useApi(webhookApi.testWebhook);

    const KV_STORAGE_BASE_URL = "https://renewing-heron-48789.kv.vercel-storage.com";
    const AUTH_HEADER = { Authorization: `Bearer Ab6VASQgZmYxOTk0ZjUtN2JlNS00MDJjLThkN2ItZjg1ZmE5ZGNhZTUwNDJhMzU2MjQyMjExNDJkNmJmYWFjYjNmYmU4NDlkY2U=` };

    async function getWorkflowState(key) {
        try {
            const response = await axios.get(`${KV_STORAGE_BASE_URL}/get/${key}`, { headers: AUTH_HEADER });
            return typeof response.data === 'string' ? JSON.parse(response.data) : (Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error getting workflow state:', error);
            return {};
        }
    }

    async function setWorkflowState(key, state) {
        try {
            await axios.post(`${KV_STORAGE_BASE_URL}/set/${key}`, JSON.stringify(state), { headers: AUTH_HEADER });
        } catch (error) {
            console.error('Error setting workflow state:', error);
        }
    }

    async function pollForWebhookResponse(uniqueId, nodeId) {
        const pollingInterval = 5000; // 5 seconds

        const poll = async () => {
            try {
                const data = await getWorkflowState('webhook_' + uniqueId, nodeId);
                if (data && Object.keys(data).length !== 0) {
                    // Handle the response data
                    setOutputResponse(data);
                    setTestNodeLoading(false);
                    const formValues = {
                        submit: true,
                        needRetest: null,
                        output: data,
                    };
                    onSubmit(formValues, 'outputResponses');
                    // Stop polling once data is received
                    clearInterval(pollInterval);
                }
            } catch (error) {
                console.error("Polling error:", error);
                // Optionally handle retry logic or stop polling after X attempts
            }
        };

        // Start polling
        let pollInterval = setInterval(poll, pollingInterval);
    }

    const onTestNodeClick = (nodeType) => {
        if (workflow.deployed) {
            setTestNodeLoading(false);
            alert('Testing trigger requires stopping workflow. Please stop workflow first');
            return;
        }

        const testNodeBody = {
            nodes,
            edges,
            nodeId
        };

        try {
            setTestNodeLoading(true);

            if (nodeType === 'scheduler') {
                simulateSchedulerNode();
            } else if (nodeType === 'webhook') {
                pollForWebhookResponse('webhook_' + workflow.shortId, nodeId);
            } else {
                const selectedNode = nodes.findIndex((nd) => nd.id === nodeId);

                testNodeApi.request(selectedNode, testNodeBody);
            }
        } catch (error) {
            setTestNodeLoading(false);
            setOutputResponse([]);
            setErrorResponse(error);
            console.error(error);
        }
    };

    const simulateSchedulerNode = () => {
        const selectedNode = nodes.find((nd) => nd.id === nodeId);
        if (!selectedNode) {
            console.error("Selected node not found.");
            return;
        }

        // Extract the schedule configuration
        const { inputParameters } = selectedNode;
        const pattern = inputParameters.find(param => param.name === 'pattern').default;
        const specificDateTime = inputParameters.find(param => param.name === 'specificDateTime').default;
        const scheduleTimes = inputParameters.find(param => param.name === 'scheduleTimes').array;

        console.log("Simulating scheduler node with pattern:", pattern, "specificDateTime:", specificDateTime, "scheduleTimes:", scheduleTimes);

        // Simulate the scheduler execution based on the configuration
        simulateScheduleExecution(pattern, specificDateTime, scheduleTimes);
    };

    const simulateScheduleExecution = (pattern, specificDateTime, scheduleTimes) => {
        if (pattern === 'once' && specificDateTime) {
            const delay = new Date(specificDateTime) - new Date();
            if (delay > 0) {
                setTimeout(() => {
                    const simulatedResponse = [{ message: `Workflow triggered at ${new Date().toISOString()}` }];
                    console.log("Simulated response:", simulatedResponse);
                    setOutputResponse(simulatedResponse);
                    setTestNodeLoading(false);
                    const formValues = {
                        submit: true,
                        needRetest: null,
                        output: simulatedResponse,
                    };
                    onSubmit(formValues, 'outputResponses');
                }, delay);
            }
        } else if (pattern === 'repetitive' && scheduleTimes) {
            console.log("Setting up repetitive schedule:", scheduleTimes);
            scheduleTimes.forEach((schedule) => {
                const interval = calculateInterval(schedule);
                if (interval > 0) {
                    const cronPattern = `*/${interval} * * * * *`;
                    const job = new Cronr(cronPattern, () => {
                        const simulatedResponse = { message: `Workflow triggered at ${new Date().toISOString()}` };
                        console.log("Cron job triggered response:", simulatedResponse);
                        setOutputResponse((prev) => [...prev, simulatedResponse]);
                    });
                    job.start();
                }
            });
            setTestNodeLoading(false);
        }
    };

    const calculateInterval = (schedule) => {
        if (schedule.mode === 'everyX') {
            const unitMultipliers = {
                seconds: 1,
                minutes: 60,
                hours: 60 * 60,
            };
            return schedule.value * unitMultipliers[schedule.unit];
        }
        // Add more logic here for other modes if necessary
        return 0;
    };

    const checkIfTestNodeValid = () => {
        const paramsTypes = nodeParamsType.filter((type) => type !== 'outputResponses');
        for (let i = 0; i < paramsTypes.length; i += 1) {
            const paramType = paramsTypes[i];

            if (!nodeFlowData[paramType] || !nodeFlowData[paramType].submit) {
                return true;
            }
        }
        return false;
    };

    const openAttachmentDialog = (outputResponse) => {
        const dialogProp = {
            title: 'Attachments',
            executionData: outputResponse
        };
        setAttachmentDialogProps(dialogProp);
        setShowAttachmentDialog(true);
    };

    const openHTMLDialog = (executionData) => {
        const dialogProp = {
            title: 'HTML',
            executionData
        };
        setHTMLDialogProps(dialogProp);
        setShowHTMLDialog(true);
    };

    const onExpandDialogClicked = (executionData) => {
        const dialogProp = {
            title: `Output Responses: ${nodeLabel} `,
            data: executionData
        };
        setExpandDialogProps(dialogProp);
        setShowExpandDialog(true);
    };

    useEffect(() => {
        if (nodeFlowData && nodeFlowData.outputResponses && nodeFlowData.outputResponses.output) {
            setOutputResponse(nodeFlowData.outputResponses.output);
        } else {
            setOutputResponse([]);
        }

        disableTestNodeBtn(checkIfTestNodeValid());

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodeFlowData, nodeParamsType]);

    useEffect(() => {
        if (nodes && nodeId) {
            const selectedNode = nodes.find((nd) => nd.id === nodeId);
            if (selectedNode) {
                setNodeName(selectedNode.data.name);
                setNodeType(selectedNode.data.type);
                setNodeLabel(selectedNode.data.label);
            }
        }
    }, [nodes, nodeId]);

    // Test node successful
    useEffect(() => {
        if (testNodeApi.data && nodeType && nodeType !== 'scheduler') {
            const testNodeData = testNodeApi.data;
            setOutputResponse(testNodeData);
            setErrorResponse(null);
            const formValues = {
                submit: true,
                needRetest: null,
                output: testNodeData
            };
            onSubmit(formValues, 'outputResponses');
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testNodeApi.data]);

    useEffect(() => {
        getTunnelURLApi.request();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (getTunnelURLApi.data) {
            setTunnelURL(getTunnelURLApi.data);
        }
    }, [getTunnelURLApi.data]);

    // Test node error
    useEffect(() => {
        if (testNodeApi.error && nodeType && nodeType !== 'scheduler') {
            let errorMessage = 'Unexpected Error.';

            if (testNodeApi.error.response && testNodeApi.error.response.data) {
                errorMessage = testNodeApi.error.response.data;
            } else if (testNodeApi.error.message) {
                errorMessage = testNodeApi.error.message;
            }

            setErrorResponse(errorMessage);
            setOutputResponse([]);
            const formValues = {
                submit: null,
                needRetest: null,
                output: []
            };
            onSubmit(formValues, 'outputResponses');
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testNodeApi.error]);

    // Test node loading
    useEffect(() => {
        if (nodeType && nodeType !== 'webhook' && nodeType !== 'scheduler') setTestNodeLoading(testNodeApi.loading);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testNodeApi.loading]);

    return (
        <>
            <Box sx={{ width: 400 }}>
                {nodeFlowData && nodeFlowData.outputResponses && nodeFlowData.outputResponses.needRetest && (
                    <Chip sx={{ mb: 2 }} icon={<IconExclamationMark />} label='Retest the node for updated parameters' color='warning' />
                )}
                {nodeName && (nodeName === 'webhook' || nodeName === 'chainLinkFunctionWebhook') && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant='h5' sx={{ mb: 1 }}>
                            Webhook URL:
                        </Typography>
                        <Typography
                            variant='h5'
                            sx={{
                                p: 1,
                                borderRadius: 2,
                                backgroundColor: theme.palette.primary.light,
                                width: 'max-content',
                                height: 'max-content',
                                mb: 2,
                                mr: 2
                            }}
                        >
                            {`https://workflow-function.vercel.app/api/v1/webhook/${workflow.shortId}`}
                        </Typography>
                        <Stack direction='row' spacing={2}>
                            <Button
                                size='small'
                                variant='outlined'
                                startIcon={<IconCopy />}
                                onClick={() => navigator.clipboard.writeText(`https://workflow-function.vercel.app/api/v1/webhook/${workflow.shortId}`)}
                            >
                                Copy URL
                            </Button>
                            <Button
                                size='small'
                                variant='outlined'
                                startIcon={<IconArrowUpRightCircle />}
                                onClick={() => window.open(`https://workflow-function.vercel.app/api/v1/webhook/${workflow.shortId}`, '_blank')}
                            >
                                Open in New Tab
                            </Button>
                        </Stack>
                        {tunnelURL && (
                            <div>
                                <Typography variant='h5' sx={{ mb: 1, mt: 2 }}>
                                    COMING SOON - Private Tunnel URL:
                                </Typography>
                                <Typography
                                    variant='h5'
                                    sx={{
                                        p: 1,
                                        borderRadius: 2,
                                        backgroundColor: theme.palette.primary.light,
                                        width: 'max-content',
                                        height: 'max-content',
                                        mb: 2,
                                        mr: 2
                                    }}
                                >
                                    {`${tunnelURL}api/v1/webhook/${nodeFlowData.webhookEndpoint}`}
                                </Typography>
                                <Stack direction='row' spacing={2}>
                                    <Button
                                        size='small'
                                        variant='outlined'
                                        startIcon={<IconCopy />}
                                        onClick={() =>
                                            navigator.clipboard.writeText(`${tunnelURL}api/v1/webhook/${nodeFlowData.webhookEndpoint}`)
                                        }
                                    >
                                        Copy URL
                                    </Button>
                                    <Button
                                        size='small'
                                        variant='outlined'
                                        startIcon={<IconArrowUpRightCircle />}
                                        onClick={() => window.open(`${tunnelURL}api/v1/webhook/${nodeFlowData.webhookEndpoint}`, '_blank')}
                                    >
                                        Open in New Tab
                                    </Button>
                                </Stack>
                            </div>
                        )}
                    </Box>
                )}
                {errorResponse && (
                    <Box sx={{ mb: 2 }}>
                        <Chip sx={{ mb: 2 }} icon={<IconX />} label='Error' color='error' />
                        <div style={{ color: 'red' }}>{errorResponse}</div>
                    </Box>
                )}
                <Box sx={{ position: 'relative' }}>
                    <ReactJson
                        theme={customization.isDarkMode ? 'ocean' : 'rjv-default'}
                        collapsed
                        style={{ padding: 10, borderRadius: 10 }}
                        src={outputResponse}
                        enableClipboard={(e) => copyToClipboard(e)}
                    />
                    <IconButton
                        size='small'
                        sx={{
                            height: 25,
                            width: 25,
                            position: 'absolute',
                            top: 5,
                            right: 5
                        }}
                        title='Expand Data'
                        color='primary'
                        onClick={() => onExpandDialogClicked(outputResponse)}
                    >
                        <IconArrowsMaximize />
                    </IconButton>
                    <div>
                        {outputResponse.map((respObj, respObjIndex) => (
                            <div key={respObjIndex}>
                                {respObj.html && (
                                    <Typography sx={{ p: 1, mt: 2 }} variant='h5'>
                                        HTML
                                    </Typography>
                                )}
                                {respObj.html && (
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            maxHeight: 400,
                                            overflow: 'auto',
                                            backgroundColor: 'white',
                                            borderRadius: 5
                                        }}
                                        dangerouslySetInnerHTML={{ __html: respObj.html }}
                                    />
                                )}
                                {respObj.html && (
                                    <StyledButton
                                        sx={{ mt: 1 }}
                                        size='small'
                                        variant='contained'
                                        onClick={() => openHTMLDialog(outputResponse)}
                                    >
                                        View HTML
                                    </StyledButton>
                                )}

                                {respObj.attachments && (
                                    <Typography sx={{ p: 1, mt: 2, pb: 0 }} variant='h5'>
                                        Attachments
                                    </Typography>
                                )}
                                {respObj.attachments &&
                                    respObj.attachments.map((attachment, attchIndex) => (
                                        <div key={attchIndex}>
                                            <Typography sx={{ p: 1 }} variant='h6'>
                                                Item {respObjIndex} |{' '}
                                                {attachment.filename ? attachment.filename : `Attachment ${attchIndex}`}
                                            </Typography>
                                            <embed
                                                src={attachment.content}
                                                width='100%'
                                                height='100%'
                                                style={{ borderStyle: 'solid' }}
                                                type={attachment.contentType}
                                            />
                                            <Button size='small' variant='contained' onClick={() => openAttachmentDialog(outputResponse)}>
                                                View Attachment
                                            </Button>
                                        </div>
                                    ))}
                            </div>
                        ))}
                    </div>
                </Box>
                <Box sx={{ mt: 2, position: 'relative' }}>
                    <AnimateButton>
                        <StyledButton
                            disableElevation
                            disabled={isTestNodeBtnDisabled || testNodeLoading}
                            fullWidth
                            size='large'
                            type='submit'
                            variant='contained'
                            color='secondary'
                            onClick={() => onTestNodeClick(nodeType)}
                        >
                            Test Node
                        </StyledButton>
                    </AnimateButton>
                    {testNodeLoading && (
                        <CircularProgress
                            size={24}
                            sx={{
                                color: theme.palette.secondary.main,
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                marginTop: '-12px',
                                marginLeft: '-12px'
                            }}
                        />
                    )}
                </Box>
            </Box>
            <AttachmentDialog
                show={showAttachmentDialog}
                dialogProps={attachmentDialogProps}
                onCancel={() => setShowAttachmentDialog(false)}
            ></AttachmentDialog>
            <HTMLDialog show={showHTMLDialog} dialogProps={HTMLDialogProps} onCancel={() => setShowHTMLDialog(false)}></HTMLDialog>
            <ExpandDataDialog
                show={showExpandDialog}
                dialogProps={expandDialogProps}
                onCancel={() => setShowExpandDialog(false)}
            ></ExpandDataDialog>
        </>
    );
};

OutputResponses.propTypes = {
    nodeId: PropTypes.string,
    nodeParamsType: PropTypes.array,
    nodeFlowData: PropTypes.object,
    nodes: PropTypes.array,
    edges: PropTypes.array,
    workflow: PropTypes.object,
    onSubmit: PropTypes.func
};

export default OutputResponses;
