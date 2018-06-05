import { dicomParser } from '../../../externalModules.js';
import getNumberValues from './getNumberValues.js';
import getValue from './getValue.js';
import getNumberValue from './getNumberValue.js';
import metaDataManager from '../metaDataManager.js';

function metaDataProvider (type, imageId) {
  const metaData = metaDataManager.get(imageId);

  if (!metaData) {
    return;
  }

  if (type === 'generalSeriesModule') {
    return {
      modality: getValue(metaData['00080060']),
      seriesInstanceUID: getValue(metaData['0020000e']),
      seriesNumber: getNumberValue(metaData['00200011']),
      studyInstanceUID: getValue(metaData['0020000d']),
      seriesDate: dicomParser.parseDA(getValue(metaData['00080021'])),
      seriesTime: dicomParser.parseTM(getValue(metaData['00080031'], 0, ''))
    };
  }

  if (type === 'patientStudyModule') {
    return {
      patientAge: getNumberValue(metaData['00101010']),
      patientSize: getNumberValue(metaData['00101020']),
      patientWeight: getNumberValue(metaData['00101030'])
    };
  }

  if (type === 'imagePlaneModule') {
    const imageOrientationPatient = getNumberValues(metaData['00200037'], 6);
    const imagePositionPatient = getNumberValues(metaData['00200032'], 3);
    const pixelSpacing = getNumberValues(metaData['00280030'], 2);
    let columnPixelSpacing = 1.0;
    let rowPixelSpacing = 1.0;

    if (pixelSpacing) {
      rowPixelSpacing = pixelSpacing[0];
      columnPixelSpacing = pixelSpacing[1];
    }

    let rowCosines = null;
    let columnCosines = null;

    if (imageOrientationPatient) {
      rowCosines = [parseFloat(imageOrientationPatient[0]), parseFloat(imageOrientationPatient[1]), parseFloat(imageOrientationPatient[2])];
      columnCosines = [parseFloat(imageOrientationPatient[3]), parseFloat(imageOrientationPatient[4]), parseFloat(imageOrientationPatient[5])];
    }

    return {
      frameOfReferenceUID: getValue(metaData['00200052']),
      rows: getNumberValue(metaData['00280010']),
      columns: getNumberValue(metaData['00280011']),
      imageOrientationPatient,
      rowCosines,
      columnCosines,
      imagePositionPatient,
      sliceThickness: getNumberValue(metaData['00180050']),
      sliceLocation: getNumberValue(metaData['00201041']),
      pixelSpacing,
      rowPixelSpacing,
      columnPixelSpacing
    };
  }

  if (type === 'imagePixelModule') {
    return {
      samplesPerPixel: getNumberValue(metaData['00280002']),
      photometricInterpretation: getValue(metaData['00280004']),
      rows: getNumberValue(metaData['00280010']),
      columns: getNumberValue(metaData['00280011']),
      bitsAllocated: getNumberValue(metaData['00280100']),
      bitsStored: getNumberValue(metaData['00280101']),
      highBit: getValue(metaData['00280102']),
      pixelRepresentation: getNumberValue(metaData['00280103']),
      planarConfiguration: getNumberValue(metaData['00280006']),
      pixelAspectRatio: getValue(metaData['00280034']),
      smallestPixelValue: getNumberValue(metaData['00280106']),
      largestPixelValue: getNumberValue(metaData['00280107']),
      redPaletteColorLookupTableDescriptor: getNumberValues(metaData['00281101']),
      greenPaletteColorLookupTableDescriptor: getNumberValues(metaData['00281102']),
      bluePaletteColorLookupTableDescriptor: getNumberValues(metaData['00281103']),
      redPaletteColorLookupTableData: getNumberValues(metaData['00281201']),
      greenPaletteColorLookupTableData: getNumberValues(metaData['00281202']),
      bluePaletteColorLookupTableData: getNumberValues(metaData['00281203'])
    };
  }

  if (type === 'voiLutModule') {
    return {
      // TODO VOT LUT Sequence
      windowCenter: getNumberValues(metaData['00281050'], 1),
      windowWidth: getNumberValues(metaData['00281051'], 1)
    };
  }

  if (type === 'modalityLutModule') {
    return {
      // TODO VOT LUT Sequence
      rescaleIntercept: getNumberValue(metaData['00281052']),
      rescaleSlope: getNumberValue(metaData['00281053']),
      rescaleType: getValue(metaData['00281054'])
    };
  }

  if (type === 'sopCommonModule') {
    return {
      sopClassUID: getValue(metaData['00080016']),
      sopInstanceUID: getValue(metaData['00080018'])
    };
  }

  if (type === 'petIsotopeModule') {
    const radiopharmaceuticalInfo = getValue(metaData['00540016']);

    if (radiopharmaceuticalInfo === undefined) {
      return;
    }

    return {
      radiopharmaceuticalInfo: {
        radiopharmaceuticalStartTime: dicomParser.parseTM(getValue(radiopharmaceuticalInfo['00181072'], 0, '')),
        radionuclideTotalDose: getNumberValue(radiopharmaceuticalInfo['00181074']),
        radionuclideHalfLife: getNumberValue(radiopharmaceuticalInfo['00181075'])
      }
    };
  }

}

export default metaDataProvider;
